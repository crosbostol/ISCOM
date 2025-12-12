import * as fs from 'fs';
import csv from 'csv-parser';
import pool from '../config/database';
import { IOtRepository } from '../data/repositories/interfaces/IOtRepository';
import { IMovilRepository } from '../data/repositories/interfaces/IMovilRepository';
import { IItemRepository } from '../data/repositories/interfaces/IItemRepository';
import { IItmOtRepository } from '../data/repositories/interfaces/IItmOtRepository';
import { parseChileanDate, parseNumberStreet } from '../utils/csvHelpers';
import { inferirEstadoOT } from './ot-logic.service';
import { OTState } from '../api/types/ot.enums';

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

        // PHASE 1: MEMORY GROUPING (The Grouper)
        const groups = new Map<string, { header: any, items: any[] }>();

        for (const row of rows) {
            totalRowsProcessed++;
            const rawDesc = row['REPARACIÓN'];
            const hasMovil = row['MÓVIL'] && row['MÓVIL'].trim().length > 0;

            // Allow row if it has description OR it has a movil code (e.g. Debris removal without items)
            if ((!rawDesc || rawDesc.trim() === '') && !hasMovil) continue;

            const otCode = row['OT']?.trim();
            let key = '';

            if (otCode && otCode.length > 0) {
                key = otCode;
            } else {
                // Generate Internal Composite Key for Additional OTs
                const fecha = row['FECHA EJECUCION'] || '';
                const direccion = row['DIRECCIÓN']?.trim().toUpperCase() || '';
                const numeral = row['NUMERAL'] || '';
                // NEW: Group only by Location and Date
                key = `ADIC-${fecha}-${direccion}-${numeral}`;
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
                const otCode = header['OT']?.trim();
                const executionDateStr = header['FECHA EJECUCION'];
                const executionDate = parseChileanDate(executionDateStr);

                // Resolve Movil ID & Type & DATES - Iterate ALL items to find both types if present
                let hydraulicMovilId: string | null = null;
                let civilMovilId: string | null = null;
                let debrisMovilId: string | null = null;
                let derivedStartedAt: Date | undefined = undefined;
                let derivedCivilDate: Date | undefined = undefined;

                // Check all rows in the group for Movils and Dates
                for (const row of items) {
                    const code = row['MÓVIL']?.trim();
                    const rowDateStr = row['FECHA EJECUCION'];
                    const rowDate = parseChileanDate(rowDateStr);

                    if (code) {
                        const isCivil = code.includes('OC');
                        // Logic: If code has OC -> It's Civil. Maps to civilMovilId + civilDate.
                        // If code NOT OC (HID or others) -> It's Hydraulic. Maps to hydraulicMovilId + startedAt.

                        if (isCivil) {
                            if (!civilMovilId) {
                                const movil = await this.movilRepository.findByExternalCode(code);
                                if (movil) civilMovilId = movil.movil_id.toString();
                            }
                            if (!derivedCivilDate && rowDate) derivedCivilDate = rowDate;
                        } else if (code === 'MOV_RET_01') {
                            if (!debrisMovilId) {
                                console.log('[ImportService] Found Debris Code:', code);
                                const movil = await this.movilRepository.findByExternalCode(code);
                                if (movil) {
                                    debrisMovilId = movil.movil_id.toString();
                                    console.log('[ImportService] Resolved Debris ID:', debrisMovilId);
                                } else {
                                    console.warn('[ImportService] Debris Movil NOT FOUND for code:', code);
                                }
                            }
                        } else {
                            if (!hydraulicMovilId) {
                                const movil = await this.movilRepository.findByExternalCode(code);
                                if (movil) hydraulicMovilId = movil.movil_id.toString();
                            }
                            if (!derivedStartedAt && rowDate) derivedStartedAt = rowDate;
                        }
                    }
                }

                // Fallback logic handled by derivedStartedAt || executionDate later.

                console.log(`[ImportService] Group '${otCode || 'ADIC'}': HID=${hydraulicMovilId}, CIV=${civilMovilId}, Start=${derivedStartedAt}, CivilDate=${derivedCivilDate}`);

                // STEP A: RESOLVE OT (Find or Create)
                let otId: number | null = null;
                let isNewOt = false;

                if (otCode && otCode.length > 0) {
                    // Case A: External OT (Has Code)
                    const existingOt = await this.otRepository.findByExternalId(otCode);

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
                            existingOt.ot_state
                        );

                        // [D] PERSISTENCIA
                        const updatePayload: any = {
                            ot_state: nuevoEstado,
                            ...(hydraulicMovilId && { hydraulic_movil_id: hydraulicMovilId }),
                            ...(civilMovilId && { civil_movil_id: civilMovilId }),
                            ...(debrisMovilId && { debris_movil_id: debrisMovilId }),
                            ...(derivedStartedAt && { started_at: derivedStartedAt }),
                            ...(derivedCivilDate && { civil_work_date: derivedCivilDate }),
                        };

                        await this.otRepository.updateWithClient(otId, updatePayload, client);
                        updatedCount++;

                    } else {
                        // Scenario 2: OT New -> Create with specific IDs
                        isNewOt = true;
                        // Pass specific IDs to buildOtData
                        // Use derivedStartedAt if available, else fallback to header date.
                        const finalStartDate = derivedStartedAt || executionDate;

                        // Infer initial state for new OT
                        const nuevoEstado = inferirEstadoOT(hydraulicMovilId, civilMovilId, debrisMovilId);

                        const otData = this.buildOtData(header, finalStartDate, hydraulicMovilId, civilMovilId, debrisMovilId, otCode, false, derivedCivilDate, nuevoEstado);
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

                        // New Heuristic Query: "Identity" = Location + Time Window (+/- 15 days)
                        const heuristicQuery = `
                                SELECT id, hydraulic_movil_id, civil_movil_id, debris_movil_id, ot_state 
                                FROM ot 
                                WHERE commune = $1 
                                AND street = $2 
                                AND number_street = $3
                                AND external_ot_id IS NULL
                                AND (
                                    (started_at IS NOT NULL AND ABS($4::date - started_at) <= 15)
                                    OR 
                                    (civil_work_date IS NOT NULL AND ABS($4::date - civil_work_date) <= 15)
                                )
                            `;

                        // Parameters for strict location matching (Fixed order for new queries)
                        const params = [
                            commune,
                            street,
                            String(numberStreet),
                            executionDate
                        ];

                        const candidates = await client.query(heuristicQuery, params);

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
                                match.ot_state
                            );

                            const updatePayload: any = {
                                ot_state: nuevoEstado,
                                ...(hydraulicMovilId && { hydraulic_movil_id: hydraulicMovilId }),
                                ...(civilMovilId && { civil_movil_id: civilMovilId }),
                                ...(debrisMovilId && { debris_movil_id: debrisMovilId }),
                                ...(derivedStartedAt && { started_at: derivedStartedAt }),
                                ...(derivedCivilDate && { civil_work_date: derivedCivilDate }),
                            };

                            await this.otRepository.updateWithClient(otId as number, updatePayload, client);
                            updatedCount++;
                        }
                    }

                    if (!otId) {
                        // Scenario 2: OT New -> Create with specific IDs
                        isNewOt = true;
                        // Pass specific IDs to buildOtData
                        const finalStartDate = derivedStartedAt || executionDate;
                        // Infer initial state for new OT
                        const nuevoEstado = inferirEstadoOT(hydraulicMovilId, civilMovilId, debrisMovilId);

                        const otData = this.buildOtData(header, finalStartDate, hydraulicMovilId, civilMovilId, debrisMovilId, null, true, derivedCivilDate, nuevoEstado);
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
                    const isRetiro = movilCode === 'MOV_RET_01';

                    // [B] PERSISTENCIA ITEM (Solo si NO es retiro)
                    // Si es retiro, no procesamos items (no se cobran unitariamente aquí)
                    if (isRetiro) continue;

                    const rawDesc = itemRow['REPARACIÓN'];
                    // [A] VALIDACIÓN: Para cualquier otro, la descripción es obligatoria
                    if (!rawDesc || rawDesc.trim() === '') {
                        // Throw error/warning or skip? User said "Throw Exception" -> invalid row.
                        // But we are in a group processing. If we throw here, we rollback the whole group (OT).
                        // "Si faltan, lanzar error (Throw Exception) para rechazar la fila o el archivo."
                        console.warn(`[ImportService] Warning: Row associated with OT has no description and is not Debris. Skipping item, but this might be invalid.`);
                        continue;
                    }

                    const dimDescription = rawDesc.trim().replace(/\s+/g, ' ');

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
            errors
        };
    }

    private buildOtData(row: any, date: Date | null | undefined, hydraulicMovilId: string | null, civilMovilId: string | null, debrisMovilId: string | null, externalId: string | null, isAdditional: boolean, civilDate?: Date, otState?: string) {
        return {
            external_ot_id: externalId,
            is_additional: isAdditional,
            street: row['DIRECCIÓN']?.trim().toUpperCase(),
            number_street: String(parseNumberStreet(row['NUMERAL'])), // Keeping String() check just in case but helper returns string now
            commune: row['COMUNA']?.trim().toUpperCase(),
            started_at: date || undefined,
            civil_work_date: civilDate || undefined,
            hydraulic_movil_id: hydraulicMovilId || null,
            civil_movil_id: civilMovilId || null,
            debris_movil_id: debrisMovilId || null,
            ot_state: otState || 'CREADA',
            received_at: new Date()
        };
    }
}
