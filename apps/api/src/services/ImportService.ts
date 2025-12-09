
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
        const errors: any[] = [];

        for (const row of rows) {
            totalProcessed++;

            // 1. Sanitization
            const rawDesc = row['REPARACIÓN'];
            if (!rawDesc || rawDesc.trim() === '') {
                continue; // Skip empty rows
            }

            const client = await pool.connect();

            try {
                await client.query('BEGIN');

                // 2. Normalization
                const itemDescription = rawDesc.trim().replace(/\s+/g, ' ');

                // 3. Resolve OT
                const otCode = row['OT']?.trim();
                const movilCode = row['MÓVIL'];
                const executionDateStr = row['FECHA EJECUCION'];
                const executionDate = parseChileanDate(executionDateStr);

                let otId: number | null = null;
                let isNewOt = false;

                // Resolve Movil ID
                let hydraulicMovilId: number | null = null;
                if (movilCode) {
                    const movil = await this.movilRepository.findByExternalCode(movilCode);
                    if (movil) hydraulicMovilId = movil.movil_id;
                }

                if (otCode && otCode.length > 0) {
                    // Case A: Has External Code
                    const existingOt = await this.otRepository.findByExternalId(otCode);
                    if (existingOt) {
                        otId = existingOt.id as number;
                    } else {
                        // Create New with External ID
                        isNewOt = true;
                        const otData: any = this.buildOtData(row, executionDate, hydraulicMovilId, otCode, false);
                        const newOt = await this.otRepository.createWithClient(otData, client);
                        otId = newOt.id;
                    }
                } else {
                    // Case B: No External Code (Heuristic Search)
                    // Check if exists by (started_at, hydraulic_movil_id) WHERE external_ot_id IS NULL

                    if (executionDate && hydraulicMovilId) {
                        const heuristicQuery = `
                            SELECT id FROM ot 
                            WHERE started_at = $1 
                            AND hydraulic_movil_id = $2 
                            AND external_ot_id IS NULL
                            LIMIT 1
                        `;
                        const existingRes = await client.query(heuristicQuery, [executionDate, hydraulicMovilId]);

                        if (existingRes.rows.length > 0) {
                            otId = existingRes.rows[0].id;
                        }
                    }

                    if (!otId) {
                        // Not found heuristically -> Create New (Additional)
                        isNewOt = true;
                        // Use row['ADICIONAL'] check or default to true for empty OT
                        const isAdditional = true; // Implicitly true if no OT code
                        const otData: any = this.buildOtData(row, executionDate, hydraulicMovilId, null, isAdditional);
                        const newOt = await this.otRepository.createWithClient(otData, client);
                        otId = newOt.id;
                    }
                }

                // 4. Resolve Item
                const itemId = await this.itemRepository.findIdByDescription(itemDescription);
                if (!itemId) {
                    // Check specific logic from legacy: 
                    // Legacy code threw error. 
                    // We could auto-create unknown items if required, but user said "Baseline applied" so we stick to legacy behavior or throw.
                    // Legacy threw Error(`Item no encontrado...`)
                    throw new Error(`Item no encontrado: '${itemDescription}'`);
                }

                // 5. Create Detail (ItmOt) - Idempotent
                if (otId) {
                    await this.createItmOtIdempotent(client, otId, itemId, row);
                }

                await client.query('COMMIT');
                successCount++;

            } catch (err: any) {
                await client.query('ROLLBACK');
                failedCount++;
                const idInfo = row['OT'] ? `OT: ${row['OT']}` : `ADDR: ${row['DIRECCIÓN']} ${row['NUMERAL']}`;
                errors.push({ key: idInfo, reason: err.message });
            } finally {
                client.release();
            }
        }

        return {
            total_processed: totalProcessed,
            success_count: successCount,
            failed_count: failedCount,
            errors
        };
    }

    private buildOtData(row: any, date: Date | null, movilId: number | null, externalId: string | null, isAdditional: boolean) {
        return {
            external_ot_id: externalId,
            is_additional: isAdditional,
            street: row['DIRECCIÓN']?.trim().toUpperCase(),
            number_street: parseNumberStreet(row['NUMERAL']),
            commune: row['COMUNA']?.trim().toUpperCase(),
            started_at: date,
            hydraulic_movil_id: movilId,
            ot_state: 'CREADA',
            received_at: new Date()
        };
    }

    private async createItmOtIdempotent(client: any, otId: number, itemId: number, row: any) {
        // Check if exists to support idempotency
        const checkQuery = `SELECT id FROM itm_ot WHERE ot_id = $1 AND item_id = $2`;
        const checkRes = await client.query(checkQuery, [otId, itemId]);

        if (checkRes.rows.length > 0) {
            // Already exists -> Do nothing (Idempotent)
            return;
        }

        const quantity = parseFloat(row['CANTIDAD']?.replace(',', '.') || '0');
        const itmOtData: ItmOtDTO = {
            ot_id: otId,
            item_id: itemId,
            quantity: quantity
        };

        await this.itmOtRepository.createWithClient(itmOtData, client);
    }
}
