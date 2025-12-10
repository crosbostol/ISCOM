import * as fs from 'fs';
import csv from 'csv-parser';
import pool from '../config/database';
import { IOtRepository } from '../data/repositories/interfaces/IOtRepository';
import { IMovilRepository } from '../data/repositories/interfaces/IMovilRepository';
import { IItemRepository } from '../data/repositories/interfaces/IItemRepository';
import { IItmOtRepository } from '../data/repositories/interfaces/IItmOtRepository';
import { ItmOtDTO } from '../data/dto/ItmOtDTO';
import { parseChileanDate, parseNumberStreet } from '../utils/csvHelpers';

export interface ImportResult {
    total_processed: number;
    success_count: number;
    failed_count: number;
    errors: any[];
    breakdown: {
        normal: number;
        additional: number;
    };
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
        let totalProcessed = 0;
        let successCount = 0;
        let failedCount = 0;
        let normalCount = 0;
        let additionalCount = 0;
        const errors: any[] = [];

        // PHASE 1: MEMORY GROUPING (The Grouper)
        const groups = new Map<string, { header: any, items: any[] }>();

        for (const row of rows) {
            totalProcessed++;
            const rawDesc = row['REPARACIÓN'];
            if (!rawDesc || rawDesc.trim() === '') continue;

            const otCode = row['OT']?.trim();
            let key = '';

            if (otCode && otCode.length > 0) {
                key = otCode;
            } else {
                // Generate Internal Composite Key for Additional OTs
                const fecha = row['FECHA EJECUCION'] || '';
                const movil = row['MÓVIL'] || '';
                const direccion = row['DIRECCIÓN']?.trim().toUpperCase() || '';
                const numeral = row['NUMERAL'] || '';
                key = `ADIC-${fecha}-${movil}-${direccion}-${numeral}`;
            }

            if (!groups.has(key)) {
                groups.set(key, { header: row, items: [] });
            }
            groups.get(key)!.items.push(row);
        }

        console.log(`[ImportService] Grouped into ${groups.size} unique OTs`);

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
                let derivedStartedAt: Date | undefined = undefined;
                let derivedCivilDate: Date | undefined = undefined;

                // Check all rows in the group for Movils and Dates
                for (const row of items) {
                    const code = row['MÓVIL'];
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
                        } else {
                            if (!hydraulicMovilId) {
                                const movil = await this.movilRepository.findByExternalCode(code);
                                if (movil) hydraulicMovilId = movil.movil_id.toString();
                            }
                            if (!derivedStartedAt && rowDate) derivedStartedAt = rowDate;
                        }
                    }
                }

                // Fallback: If no startedAt found (e.g. only Civil rows), use executionDate from Header (as is done previously) but be careful.
                // Actually, if only Civil rows exist, startedAt might remain undefined/null for now, or we force it.
                // Let's rely on what we found. If it's a pure Civil OT, startedAt might be null? 
                // Creating an OT usually requires started_at. Let's fallback to header date if derivedStartedAt is missing AND it's a new OT.
                // For now, let's proceed with what we extracted.

                console.log(`[ImportService] Group '${otCode || 'ADIC'}': HID=${hydraulicMovilId}, CIV=${civilMovilId}, Start=${derivedStartedAt}, CivilDate=${derivedCivilDate}`);

                // STEP A: RESOLVE OT (Find or Create)
                let otId: number | null = null;
                let isNewOt = false;

                if (otCode && otCode.length > 0) {
                    // Case A: External OT (Has Code)
                    const existingOt = await this.otRepository.findByExternalId(otCode);
                    if (existingOt) {
                        otId = existingOt.id as number;

                        // Scenario 1: OT Found -> Upsert (Merge)
                        // Scenario 1: OT Found -> Upsert (Merge)
                        console.log(`[ImportService] found OT ${otId}, merging data.`);
                        await this.otRepository.updateMovilAndDates(otId, hydraulicMovilId, civilMovilId, derivedStartedAt, derivedCivilDate, client);

                    } else {
                        // Scenario 2: OT New -> Create with specific IDs
                        isNewOt = true;
                        // Pass specific IDs to buildOtData
                        // Use derivedStartedAt if available, else fallback to header date.
                        const finalStartDate = derivedStartedAt || executionDate;

                        const otData = this.buildOtData(header, finalStartDate, hydraulicMovilId, civilMovilId, otCode, false, derivedCivilDate);
                        console.log(`[ImportService] Creating NEW OT Data:`, JSON.stringify(otData, null, 2));
                        const newOt = await this.otRepository.createWithClient(otData, client);
                        otId = newOt.id;
                        normalCount++;
                    }
                } else {
                    // Case B: Additional OT (Heuristic Search by Location)
                    if (executionDate) {
                        const street = header['DIRECCIÓN']?.trim().toUpperCase();
                        const numberStreet = parseNumberStreet(header['NUMERAL']);
                        const commune = header['COMUNA']?.trim().toUpperCase();

                        // New Heuristic Query: "Identity" = Date + Location.
                        const heuristicQuery = `
                            SELECT id, hydraulic_movil_id, civil_movil_id 
                            FROM ot 
                            WHERE started_at = $1 
                            AND commune = $2 
                            AND street = $3 
                            AND number_street = $4
                            AND external_ot_id IS NULL
                        `;

                        // Parameters for strict location matching
                        const params = [
                            executionDate,
                            commune,
                            street,
                            String(numberStreet)
                        ];

                        const candidates = await client.query(heuristicQuery, params);

                        if (candidates.rows.length > 0) {
                            // Find existing match
                            const match = candidates.rows[0];
                            otId = match.id;

                            // Scenario 1: OT Found -> Upsert (Merge)
                            // Scenario 1: OT Found -> Upsert (Merge)
                            await this.otRepository.updateMovilAndDates(otId as number, hydraulicMovilId, civilMovilId, derivedStartedAt, derivedCivilDate, client);
                        }
                    }

                    if (!otId) {
                        // Scenario 2: OT New -> Create with specific IDs
                        isNewOt = true;
                        // Pass specific IDs to buildOtData
                        // Pass specific IDs to buildOtData
                        const finalStartDate = derivedStartedAt || executionDate;
                        const otData = this.buildOtData(header, finalStartDate, hydraulicMovilId, civilMovilId, null, true, derivedCivilDate);
                        const newOt = await this.otRepository.createWithClient(otData, client);
                        otId = newOt.id;
                        additionalCount++;
                    }
                }

                if (!otId) throw new Error("Could not resolve OT ID");

                // STEP B: AGGREGATE ITEMS (In-Memory Fix for Data Loss)
                const aggregatedItems = new Map<string, { itemId: any, description: string, quantity: number }>();

                for (const itemRow of items) {
                    const rawDesc = itemRow['REPARACIÓN'];
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
                successCount += items.length;

            } catch (err: any) {
                await client.query('ROLLBACK');
                failedCount += group.items.length;
                errors.push({ key: key, reason: err.message });
                console.error(`[ImportService] Error processing group ${key}:`, err);
            } finally {
                client.release();
            }
        }

        return {
            total_processed: totalProcessed,
            success_count: successCount,
            failed_count: failedCount,
            errors,
            breakdown: {
                normal: normalCount,
                additional: additionalCount
            }
        };
    }

    private buildOtData(row: any, date: Date | null | undefined, hydraulicMovilId: string | null, civilMovilId: string | null, externalId: string | null, isAdditional: boolean, civilDate?: Date) {
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
            ot_state: 'CREADA',
            received_at: new Date()
        };
    }
}
