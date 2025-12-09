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

                // Resolve Movil ID
                let hydraulicMovilId: number | null = null;
                const movilCode = header['MÓVIL'];
                if (movilCode) {
                    const movil = await this.movilRepository.findByExternalCode(movilCode);
                    if (movil) hydraulicMovilId = movil.movil_id;
                }

                // STEP A: RESOLVE OT (Find or Create)
                let otId: number | null = null;
                let isNewOt = false;

                if (otCode && otCode.length > 0) {
                    // Case A: External OT
                    const existingOt = await this.otRepository.findByExternalId(otCode);
                    if (existingOt) {
                        otId = existingOt.id as number;
                        normalCount++;
                    } else {
                        isNewOt = true;
                        const otData = this.buildOtData(header, executionDate, hydraulicMovilId, otCode, false);
                        const newOt = await this.otRepository.createWithClient(otData, client);
                        otId = newOt.id;
                        normalCount++;
                    }
                } else {
                    // Case B: Additional OT (Heuristic Search)
                    if (executionDate) {
                        const street = header['DIRECCIÓN']?.trim().toUpperCase();
                        const numberStreet = parseNumberStreet(header['NUMERAL']);
                        const commune = header['COMUNA']?.trim().toUpperCase();

                        // Heuristic Query using partial index
                        // Note: idx_ot_heuristic_search is (started_at, hydraulic_movil_id) WHERE external_ot_id IS NULL
                        const heuristicQuery = `
                            SELECT id, street, number_street FROM ot 
                            WHERE started_at = $1 
                            AND hydraulic_movil_id = $2
                            AND external_ot_id IS NULL
                        `;

                        const candidates = await client.query(heuristicQuery, [executionDate, hydraulicMovilId ? hydraulicMovilId.toString() : null]);

                        // Memory Filter for exact address match
                        const match = candidates.rows.find(c =>
                            c.street === street &&
                            String(c.number_street) === String(numberStreet)
                        );

                        if (match) {
                            otId = match.id;
                            additionalCount++;
                        }
                    }

                    if (!otId) {
                        isNewOt = true;
                        const otData = this.buildOtData(header, executionDate, hydraulicMovilId, null, true);
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

    private buildOtData(row: any, date: Date | null, movilId: number | null, externalId: string | null, isAdditional: boolean) {
        return {
            external_ot_id: externalId,
            is_additional: isAdditional,
            street: row['DIRECCIÓN']?.trim().toUpperCase(),
            number_street: String(parseNumberStreet(row['NUMERAL'])),
            commune: row['COMUNA']?.trim().toUpperCase(),
            started_at: date || undefined,
            hydraulic_movil_id: movilId ? movilId.toString() : null,
            ot_state: 'CREADA',
            received_at: new Date()
        };
    }
}
