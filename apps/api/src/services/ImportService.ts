import * as fs from 'fs';
import csv from 'csv-parser';
import pool from '../config/database';
import { IOtRepository } from '../data/repositories/interfaces/IOtRepository';
import { IMovilRepository } from '../data/repositories/interfaces/IMovilRepository';
import { IItemRepository } from '../data/repositories/interfaces/IItemRepository';
import { IItmOtRepository } from '../data/repositories/interfaces/IItmOtRepository';
import { parseChileanDate, parseNumberStreet } from '../utils/csvHelpers';
import { inferirEstadoOT, generateObservationText } from './ot-logic.service';
import { OTState } from '../api/types/ot.enums';
import { DEBRIS_RULES, MOVIL_PATTERNS } from '../config/business-rules';

export interface ImportResult {
    summary: {
        total_rows_processed: number;
        unique_ots_found: number;
        breakdown_by_type: {
            normal: number;
            additional: number;
        };
    };
    db_operations: {
        created: number;
        updated: number;
    };
    errors: any[];
    warnings: string[];
}

export class ImportService {
    constructor(
        private otRepository: IOtRepository,
        private movilRepository: IMovilRepository,
        private itemRepository: IItemRepository,
        private itmOtRepository: IItmOtRepository
    ) { }

    async processCsv(filePath: string): Promise<ImportResult> {
        console.log(`[ImportService] Starting CSV Processing: ${filePath}`);
        const rows: any[] = [];

        return new Promise((resolve, reject) => {
            const stream = fs.createReadStream(filePath, { encoding: 'utf-8' })
                .pipe(csv({
                    separator: ';',
                    mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, '').toUpperCase()
                }));

            stream.on('data', (data) => rows.push(data));

            stream.on('end', async () => {
                console.log(`[ImportService] CSV Parsed. Rows: ${rows.length}`);
                try {
                    const result = await this.processRows(rows);
                    resolve(result);
                } catch (error) {
                    console.error('[ImportService] Fatal Error:', error);
                    reject(error);
                } finally {
                    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                }
            });

            stream.on('error', (error) => {
                console.error('[ImportService] Stream Error:', error);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                reject(error);
            });
        });
    }

    private async processRows(rows: any[]): Promise<ImportResult> {
        // Initialize Counters
        let totalRowsProcessed = 0;
        let normalCount = 0;
        let additionalCount = 0;
        let createdCount = 0;
        let updatedCount = 0;
        const errors: any[] = [];
        const warnings: string[] = [];

        // PHASE 1: MEMORY GROUPING (The Two-Pass Grouper)
        const groups = new Map<string, { header: any, items: any[] }>();
        const addressToOtCode = new Map<string, string>();

        // Pass 1: Build Address Index (Identify addresses that HAVE an OT code)
        for (const row of rows) {
            const otCode = row['OT']?.trim();
            if (otCode && otCode.length > 0) {
                const addressKey = this.normalizeAddress(row);
                // Store the first OT code found for this address (assuming consistent if multiple)
                if (!addressToOtCode.has(addressKey)) {
                    addressToOtCode.set(addressKey, otCode);
                }
            }
        }

        // Pass 2: Grouping with Merge Strategy
        for (const row of rows) {
            totalRowsProcessed++;
            const rawDesc = row['REPARACIÓN'];
            const hasMovil = row['MÓVIL'] && row['MÓVIL'].trim().length > 0;

            if ((!rawDesc || rawDesc.trim() === '') && !hasMovil) continue;

            const otCode = row['OT']?.trim();
            const addressKey = this.normalizeAddress(row);
            const knownOtCode = addressToOtCode.get(addressKey);

            let key = '';

            if (knownOtCode) {
                // If ANY row with this address had an OT code, force ALL rows to that OT code
                key = knownOtCode;
            } else if (otCode && otCode.length > 0) {
                // Should be covered by above, but fallback for safety
                key = otCode;
            } else {
                // Purely additional (No row with this address has an OT code)
                key = `ADIC-${addressKey}`;
            }

            if (!groups.has(key)) {
                groups.set(key, { header: row, items: [] });
            }
            groups.get(key)!.items.push(row);
        }

        console.log(`[ImportService] Grouped into ${groups.size} unique OTs`);

        // Counter: Unique OTs found in file
        const uniqueOtsFound = groups.size;

        // PHASE 2: PERSISTENCE (The Idempotent Loader)
        for (const [key, group] of groups) {
            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                const { header, items } = group;
                const otCode = header['OT']?.trim(); // Note: header might be the first row, which might NOT have the OT code if order was mixed. 
                // Correction: If the group key is NOT an ADIC key, we should use the key as the OT code to be safe, 
                // OR ensure 'header' is a row that actually has the code.
                // However, since we group by 'key', if 'key' is knownOtCode, we can trust 'key'.
                // Let's rely on 'otCode' derived from 'key' if possible, or just use what we have. 
                // Better yet, update 'otCode' check below to check the Key or find a row with code.

                // Effective OT Code for this group (Fix for when header row is the one missing the code)
                const effectiveOtCode = (!key.startsWith('ADIC-')) ? key : null;

                const executionDateStr = header['FECHA EJECUCION'];
                const executionDate = parseChileanDate(executionDateStr);

                // Resolve Movil ID & Type & DATES - Iterate ALL items to find both types if present
                let hydraulicMovilId: string | null = null;
                let civilMovilId: string | null = null;
                let debrisMovilId: string | null = null;
                let derivedStartedAt: Date | undefined = undefined; // Hydraulic
                let derivedCivilDate: Date | undefined = undefined; // Civil
                let derivedDebrisDate: Date | undefined = undefined; // Debris

                // Check all rows in the group for Movils and Dates
                for (const row of items) {
                    const code = row['MÓVIL']?.trim();
                    const rowDateStr = row['FECHA EJECUCION'];
                    const rowDate = parseChileanDate(rowDateStr);

                    if (code) {
                        const isCivil = code.includes(MOVIL_PATTERNS.CIVIL) || code.includes(MOVIL_PATTERNS.CIVIL_ALT);

                        if (isCivil) {
                            if (!civilMovilId) {
                                const movil = await this.movilRepository.findByExternalCode(code);
                                if (movil) civilMovilId = movil.movil_id.toString();
                            }
                            // Logic: Use LATEST date if duplicates exist (Requirement 4)
                            if (rowDate) {
                                if (!derivedCivilDate || rowDate > derivedCivilDate) {
                                    derivedCivilDate = rowDate;
                                }
                            }
                        } else if (MOVIL_PATTERNS.DEBRIS.some((id: string) => code.includes(id))) {
                            if (!debrisMovilId) {
                                const movil = await this.movilRepository.findByExternalCode(code);
                                if (movil) debrisMovilId = movil.movil_id.toString();
                            }
                            // Capture Debris Date (Latest)
                            if (rowDate) {
                                if (!derivedDebrisDate || rowDate > derivedDebrisDate) {
                                    derivedDebrisDate = rowDate;
                                }
                            }
                        } else {
                            if (!hydraulicMovilId) {
                                const movil = await this.movilRepository.findByExternalCode(code);
                                if (movil) hydraulicMovilId = movil.movil_id.toString();
                            }

                            const isHydraulic = MOVIL_PATTERNS.HYDRAULIC.some((prefix: string) => code.startsWith(prefix));

                            if (isHydraulic) {
                                // Capture Hydraulic Start Date (Latest)
                                if (rowDate) {
                                    if (!derivedStartedAt || rowDate > derivedStartedAt) {
                                        derivedStartedAt = rowDate;
                                    }
                                }
                            }
                        }

                    }
                }

                // Fallback logic handled by derivedStartedAt || executionDate later.

                console.log(`[ImportService] Group '${effectiveOtCode || 'ADIC'}': HID=${hydraulicMovilId}, CIV=${civilMovilId}, Start=${derivedStartedAt}, CivilDate=${derivedCivilDate}`);

                // STEP A: RESOLVE OT (Find or Create)
                let otId: number | null = null;
                let isNewOt = false;

                if (effectiveOtCode && effectiveOtCode.length > 0) {
                    // Case A: External OT (Has Code)
                    const existingOt = await this.otRepository.findByExternalId(effectiveOtCode);

                    if (existingOt) {
                        otId = existingOt.id as number;
                        console.log(`[ImportService] found OT ${otId}, merging data.`);

                        // [B] FUSIÓN (MERGE)
                        const finalHydraulic = hydraulicMovilId || existingOt.hydraulic_movil_id;
                        const finalCivil = civilMovilId || existingOt.civil_movil_id;
                        const finalDebris = debrisMovilId || existingOt.debris_movil_id;

                        // [C] INFERENCIA DE ESTADO
                        const nuevoEstado = inferirEstadoOT(
                            finalHydraulic,
                            finalCivil,
                            finalDebris,
                            derivedDebrisDate || existingOt.finished_at, // Pass new date or existing
                            existingOt.ot_state
                        );

                        // [C.1] GENERAR OBSERVACIÓN (Si aplica)
                        const observationText = generateObservationText(nuevoEstado, finalHydraulic, finalCivil) || '';

                        // [D] PERSISTENCIA
                        const updatePayload: any = {
                            ot_state: nuevoEstado,
                            ...(
                                nuevoEstado === OTState.OBSERVADA && observationText
                                    ? { observation: observationText }
                                    : (
                                        nuevoEstado !== OTState.OBSERVADA
                                            && existingOt.ot_state === OTState.OBSERVADA
                                            && existingOt.observation
                                            && typeof existingOt.observation === 'string'
                                            && existingOt.observation.startsWith('[SISTEMA]')
                                            ? { observation: null }
                                            : {}
                                    )
                            ),
                            ...(hydraulicMovilId && { hydraulic_movil_id: hydraulicMovilId }),
                            ...(civilMovilId && { civil_movil_id: civilMovilId }),
                            ...(debrisMovilId && { debris_movil_id: debrisMovilId }),
                            ...(derivedStartedAt && { started_at: derivedStartedAt }),
                            ...(derivedCivilDate && { civil_work_at: derivedCivilDate }),
                            ...(derivedDebrisDate && { finished_at: derivedDebrisDate }),
                        };

                        await this.otRepository.updateWithClient(otId, updatePayload, client);
                        updatedCount++;

                    } else {
                        // Scenario 2: OT New -> Create with specific IDs
                        isNewOt = true;
                        // Pass specific IDs to buildOtData
                        // Use derivedStartedAt if available, else fallback to header date.
                        const finalStartDate = derivedStartedAt;

                        // Infer initial state for new OT
                        const nuevoEstado = inferirEstadoOT(hydraulicMovilId, civilMovilId, debrisMovilId, derivedDebrisDate);

                        // [C.1] GENERAR OBSERVACIÓN (Si aplica)
                        const observationText = generateObservationText(nuevoEstado, hydraulicMovilId, civilMovilId) || '';

                        const otData = this.buildOtData(header, finalStartDate, hydraulicMovilId, civilMovilId, debrisMovilId, effectiveOtCode, false, derivedCivilDate, nuevoEstado, derivedDebrisDate, observationText);
                        console.log(`[ImportService] Creating NEW OT Data:`, JSON.stringify(otData, null, 2));
                        const newOt = await this.otRepository.createWithClient(otData, client);
                        otId = newOt.id;
                        createdCount++;
                    }
                    normalCount++;
                } else {
                    // Case B: Additional OT (Heuristic Search by Location)
                    if (executionDate) {
                        const street = header['DIRECCIÓN']?.trim().toUpperCase();
                        const numberStreet = parseNumberStreet(header['NUMERAL']);
                        const commune = header['COMUNA']?.trim().toUpperCase();

                        // New Heuristic Query: "Identity" = Location + Time Window (+/- 30 days). Finds ANY OT (with or without code) to merge into.
                        // FIX: Use COALESCE to check ANY available date (started, civil, finished, or received) to avoid missing OTs that have partial data.
                        // NOTE: 'created_at' does not exist in DB, using 'received_at' which defaults to CURRENT_DATE.
                        const heuristicQuery = `
                            SELECT id, hydraulic_movil_id, civil_movil_id, debris_movil_id, ot_state, observation, finished_at 
                            FROM ot 
                            WHERE 
                                TRIM(UPPER(commune)) = TRIM(UPPER($1)) 
                                AND TRIM(UPPER(street)) = TRIM(UPPER($2)) 
                                AND TRIM(number_street) = TRIM($3) 
                                AND ABS($4::date - COALESCE(started_at, civil_work_at, finished_at, received_at)::date) <= 30
                        `;

                        // Parameters for strict location matching
                        const params = [
                            commune,
                            street,
                            String(numberStreet),
                            executionDate
                        ];

                        console.log(`[ImportService] Searching duplicate OT | Commune: ${commune}, Street: ${street}, Num: ${numberStreet}, Date: ${executionDate}`);

                        const candidates = await client.query(heuristicQuery, params);

                        console.log(`[ImportService] Candidates found: ${candidates.rows.length}`);

                        if (candidates.rows.length > 0) {
                            // Find existing match
                            const match = candidates.rows[0];
                            otId = match.id;

                            // Scenario 1: OT Found -> Upsert (Merge)
                            const finalHydraulic = hydraulicMovilId || match.hydraulic_movil_id;
                            const finalCivil = civilMovilId || match.civil_movil_id;
                            const finalDebris = debrisMovilId || match.debris_movil_id;

                            // [C] INFERENCIA DE ESTADO
                            const nuevoEstado = inferirEstadoOT(
                                finalHydraulic,
                                finalCivil,
                                finalDebris,
                                derivedDebrisDate || match.finished_at,
                                match.ot_state
                            );

                            // [C.1] GENERAR OBSERVACIÓN (Si aplica)
                            const observationText = generateObservationText(nuevoEstado, finalHydraulic, finalCivil) || '';

                            const updatePayload: any = {
                                ot_state: nuevoEstado,
                                ...(
                                    nuevoEstado === OTState.OBSERVADA && observationText
                                        ? { observation: observationText }
                                        : (
                                            nuevoEstado !== OTState.OBSERVADA
                                                && match.ot_state === OTState.OBSERVADA
                                                && match.observation
                                                && typeof match.observation === 'string'
                                                && match.observation.startsWith('[SISTEMA]')
                                                ? { observation: null }
                                                : {}
                                        )
                                ),
                                ...(hydraulicMovilId && { hydraulic_movil_id: hydraulicMovilId }),
                                ...(civilMovilId && { civil_movil_id: civilMovilId }),
                                ...(debrisMovilId && { debris_movil_id: debrisMovilId }),
                                ...(derivedStartedAt && { started_at: derivedStartedAt }),
                                ...(derivedCivilDate && { civil_work_at: derivedCivilDate }),
                                ...(derivedDebrisDate && { finished_at: derivedDebrisDate }),
                            };

                            await this.otRepository.updateWithClient(otId as number, updatePayload, client);
                            updatedCount++;
                        }
                    }

                    if (!otId) {
                        // Scenario 2: OT New -> Create with specific IDs
                        isNewOt = true;
                        // Pass specific IDs to buildOtData
                        const finalStartDate = derivedStartedAt;
                        // Infer initial state for new OT
                        const nuevoEstado = inferirEstadoOT(hydraulicMovilId, civilMovilId, debrisMovilId, derivedDebrisDate);

                        // [C.1] GENERAR OBSERVACIÓN (Si aplica)
                        const observationText = generateObservationText(nuevoEstado, hydraulicMovilId, civilMovilId) || '';

                        const otData = this.buildOtData(header, finalStartDate, hydraulicMovilId, civilMovilId, debrisMovilId, null, true, derivedCivilDate, nuevoEstado, derivedDebrisDate, observationText);
                        const newOt = await this.otRepository.createWithClient(otData, client);
                        otId = newOt.id;
                        createdCount++;
                    }
                    additionalCount++; // Always count as additional if no code
                }

                if (!otId) throw new Error("Could not resolve OT ID");

                // STEP B: AGGREGATE ITEMS (In-Memory Fix for Data Loss)
                const aggregatedItems = new Map<string, { itemId: any, description: string, quantity: number }>();

                for (const itemRow of items) {
                    const movilCode = itemRow['MÓVIL']?.trim();
                    const isDebris = movilCode && MOVIL_PATTERNS.DEBRIS.some((id: string) => movilCode.includes(id));

                    const rawDesc = itemRow['REPARACIÓN'];
                    // [B] DEBRIS LOGIC
                    if (isDebris) {
                        // Case A: Empty Description -> OK (Skip item, just charge the trip/OT)
                        if (!rawDesc || rawDesc.trim() === '') continue;

                        const dimDescription = rawDesc.trim().toUpperCase().replace(/\s+/g, ' ');

                        // Case B: Allowed Item -> OK (Process it)
                        // Note: DEBRIS_RULES.allowedItems is readonly, need to cast or use some()
                        const isAllowed = DEBRIS_RULES.allowedItems.some((allowed: string) => allowed === dimDescription.toUpperCase());

                        if (!isAllowed) {
                            // Case C: Invalid -> Warning & Skip
                            const warnMsg = `Fila (Móvil ${movilCode}): Ítem '${dimDescription}' no permitido para retiro. Se creó la OT sin este ítem.`;
                            warnings.push(warnMsg);
                            continue;
                        }

                        // Case D: Zero Quantity Check
                        const rawQty = itemRow['CANTIDAD']?.replace(',', '.') || '0';
                        const qty = parseFloat(rawQty);

                        if (isNaN(qty) || qty <= 0) {
                            // Valid Item but Zero Quantity -> Warning & Skip
                            const warnMsg = `Fila (Móvil ${movilCode}): Ítem '${dimDescription}' tiene cantidad 0 o inválida. Se creó la OT sin este ítem.`;
                            warnings.push(warnMsg);
                            continue;
                        }
                        // If Allowed AND Quantity > 0, proceed to standard logic below.
                    }

                    // [B] PERSISTENCIA ITEM (Standard Logic)
                    // If it was Debris AND Allowed, it falls through here.
                    // If it was NOT Debris, it falls through here.

                    // [A] VALIDACIÓN: Para cualquier otro (inc Clásicos y Debris Permitidos), la descripción es obligatoria
                    if (!rawDesc || rawDesc.trim() === '') {
                        // Throw error/warning or skip? User said "Throw Exception" -> invalid row.
                        // But we are in a group processing. If we throw here, we rollback the whole group (OT).
                        // "Si faltan, lanzar error (Throw Exception) para rechazar la fila o el archivo."
                        console.warn(`[ImportService] Warning: Row associated with OT has no description and is not Debris (or empty Debris). Skipping item, but this might be invalid.`);
                        continue;
                    }

                    const dimDescription = rawDesc.trim().toUpperCase().replace(/\s+/g, ' ');

                    // Resolve Item ID - We do this inside to ensure we have the ID for the key/insert
                    // Optimization: We could cache IDs but for now we follow existing pattern (or cache locally in map)
                    const itemId = await this.itemRepository.findIdByDescription(dimDescription);

                    if (!itemId) {
                        throw new Error(`Item no encontrado: '${dimDescription}'`);
                    }

                    const quantity = parseFloat(itemRow['CANTIDAD']?.replace(',', '.') || '0');
                    const key = String(itemId); // Use ItemID as unique key for aggregation

                    if (aggregatedItems.has(key)) {
                        const existing = aggregatedItems.get(key)!;
                        existing.quantity += quantity;
                    } else {
                        aggregatedItems.set(key, {
                            itemId: itemId, // Kept as any/string based onrepo result
                            description: dimDescription,
                            quantity: quantity
                        });
                    }
                }

                // STEP C: INSERT AGGREGATED ITEMS
                for (const aggItem of aggregatedItems.values()) {
                    // UPSERT / ON CONFLICT DO NOTHING
                    const insertQuery = `
                    INSERT INTO itm_ot (ot_id, item_id, quantity, created_at)
                    VALUES ($1, $2, $3, CURRENT_DATE)
                    ON CONFLICT (ot_id, item_id) DO NOTHING
                `;
                    await client.query(insertQuery, [otId, aggItem.itemId, aggItem.quantity]);
                }

                await client.query('COMMIT');

            } catch (err: any) {
                await client.query('ROLLBACK');
                const sampleRows = group.items ? group.items.slice(0, 3) : []; // Guardamos las primeras 3 filas de muestra

                errors.push({
                    key: key,
                    reason: err.message,
                    sample_data: sampleRows
                });

                console.error(`[ImportService] Error processing group ${key}:`, err, 'Sample rows:', sampleRows);
            } finally {
                client.release();
            }
        }

        return {
            summary: {
                total_rows_processed: totalRowsProcessed,
                unique_ots_found: uniqueOtsFound,
                breakdown_by_type: {
                    normal: normalCount,
                    additional: additionalCount
                }
            },
            db_operations: {
                created: createdCount,
                updated: updatedCount
            },
            errors,
            warnings
        };
    }

    private normalizeAddress(row: any): string {
        const direccion = row['DIRECCIÓN']?.trim().toUpperCase() || '';
        // Ensure numeral is treated as string and trimmed
        const numeral = (row['NUMERAL'] || '').toString().trim();
        const comuna = row['COMUNA']?.trim().toUpperCase() || '';
        return `${direccion}-${numeral}-${comuna}`;
    }

    private buildOtData(row: any, date: Date | null | undefined, hydraulicMovilId: string | null, civilMovilId: string | null, debrisMovilId: string | null, externalId: string | null, isAdditional: boolean, civilDate?: Date, otState?: string, debrisDate?: Date, observation?: string | null) {
        return {
            external_ot_id: externalId,
            is_additional: isAdditional,
            street: row['DIRECCIÓN']?.trim().toUpperCase(),
            number_street: String(parseNumberStreet(row['NUMERAL'])), // Keeping String() check just in case but helper returns string now
            commune: row['COMUNA']?.trim().toUpperCase(),
            started_at: date || undefined,
            civil_work_at: civilDate || undefined,
            finished_at: debrisDate || undefined,
            hydraulic_movil_id: hydraulicMovilId || null,
            civil_movil_id: civilMovilId || null,
            debris_movil_id: debrisMovilId || null,
            ot_state: otState || 'CREADA',
            observation: observation || null,
            received_at: new Date()
        };
    }
}
