import * as fs from 'fs';
import csv from 'csv-parser';
import pool from '../config/database';
import { IOtRepository } from '../data/repositories/interfaces/IOtRepository';
import { IMovilRepository } from '../data/repositories/interfaces/IMovilRepository';
import { IItemRepository } from '../data/repositories/interfaces/IItemRepository';
import { IItmOtRepository } from '../data/repositories/interfaces/IItmOtRepository';
import { OrdenTrabajoDTO } from '../data/dto/OrdenTrabajoDTO';
import { ItmOtDTO } from '../data/dto/ItmOtDTO';
import { parseChileanDate, parseChileanMoney, parseNumberStreet } from '../utils/csvHelpers';

export class OtService {
    constructor(
        private otRepository: IOtRepository,
        private movilRepository: IMovilRepository,
        private itemRepository: IItemRepository,
        private itmOtRepository: IItmOtRepository
    ) { }

    async createOt(data: OrdenTrabajoDTO): Promise<any> {
        // Here we could add logic to check if external_ot_id is null, then set is_additional = true, etc.
        // Repository handles basic mapping.
        return this.otRepository.create(data);
    }

    async getAllOts(): Promise<OrdenTrabajoDTO[]> {
        return this.otRepository.findAll();
    }

    async getOtById(id: number): Promise<OrdenTrabajoDTO | null> {
        return this.otRepository.findById(id);
    }

    async updateOt(id: number, data: Partial<OrdenTrabajoDTO>): Promise<any> {
        return this.otRepository.update(id, data);
    }

    async rejectOt(id: number): Promise<any> {
        return this.otRepository.softDelete(id);
    }

    async getOtTable(): Promise<any[]> {
        return this.otRepository.getOtTable();
    }

    async getOtTableByState(state: string): Promise<any[]> {
        return this.otRepository.getOtTableByState(state);
    }

    async getFinishedOtsByRangeDate(start: string, end: string): Promise<OrdenTrabajoDTO[]> {
        return this.otRepository.findByRangeDate(start, end);
    }

    async getOtsByState(state: string): Promise<OrdenTrabajoDTO[]> {
        return this.otRepository.findByState(state);
    }

    async getRejectedOts(): Promise<OrdenTrabajoDTO[]> {
        return this.otRepository.findRejected();
    }
    async processCsv(filePath: string): Promise<any> {
        console.log(`[OtService] Starting CSV Processing: ${filePath}`);
        const results: any[] = [];
        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath, { encoding: 'utf-8' })
                .pipe(csv({
                    separator: ';',
                    mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, '').toUpperCase()
                }))
                .on('data', (data) => results.push(data))
                .on('end', async () => {
                    console.log(`[OtService] CSV Parsing Complete. Rows found: ${results.length}`);
                    if (results.length > 0) {
                        console.log(`[OtService] First Row Keys: ${Object.keys(results[0]).join(', ')}`);
                        console.log(`[OtService] First Row Sample:`, results[0]);
                    }
                    try {
                        const result = await this.processRows(results);
                        resolve(result);
                    } catch (error) {
                        console.error('[OtService] Error in processRows:', error);
                        reject(error);
                    } finally {
                        if (fs.existsSync(filePath)) {
                            fs.unlinkSync(filePath);
                        }
                    }
                })
                .on('error', (error) => {
                    console.error('[OtService] CSV Stream Error:', error);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                    reject(error);
                });
        });
    }

    private async processRows(rows: any[]): Promise<any> {
        console.log(`[OtService] processRows started with ${rows.length} rows.`);
        let totalProcessed = 0;
        let successCount = 0;
        let failedCount = 0;
        const errors: any[] = [];

        for (const row of rows) {
            // 1. Sanitization (Minimalist)
            const rawDesc = row['REPARACIÓN']; // Verify EXACT header name

            if (!rawDesc || rawDesc.trim() === '') {
                console.log(`[OtService] Skipping row due to empty REPARACIÓN. Keys present: ${Object.keys(row).join(',')}`);
                continue;
            }

            totalProcessed++;
            const client = await pool.connect();

            try {
                // Transaction per row
                await client.query('BEGIN');

                // 2. OT Logic
                const otCode = row['OT']?.trim();
                let otId: number;
                let external_ot_id: string | null = null;
                let is_additional = false;

                // Prepare common OT data
                const otData: any = {
                    street: row['DIRECCIÓN']?.trim().toUpperCase(),
                    number_street: parseNumberStreet(row['NUMERAL']),
                    commune: row['COMUNA']?.trim().toUpperCase(),
                    started_at: parseChileanDate(row['FECHA EJECUCION']),
                    hydraulic_movil_id: null, // Will optionally set below
                    ot_state: 'CREADA',
                    received_at: new Date()
                };

                // Movil Lookup
                const movilCode = row['MÓVIL'];
                if (movilCode) {
                    const movil = await this.movilRepository.findByExternalCode(movilCode);
                    if (movil) otData.hydraulic_movil_id = movil.movil_id;
                }

                if (otCode && otCode.length > 0) {
                    // Case A: Has OT Code
                    external_ot_id = otCode;
                    const existingOt = await this.otRepository.findByExternalId(otCode);

                    if (existingOt) {
                        // Use existing
                        otId = existingOt.id as number;
                        // Note: We are NOT updating the OT header here, assuming existing is correct.
                        // If we needed to update, we would call otRepository.updateWithClient (if it existed) or similar.
                    } else {
                        // Create New
                        otData.external_ot_id = external_ot_id;
                        otData.is_additional = false;
                        const newOt = await this.otRepository.createWithClient(otData, client);
                        otId = newOt.id;
                    }
                } else {
                    // Case B: No OT Code (Additional)
                    // Always Create new OT
                    otData.external_ot_id = null;
                    otData.is_additional = true;
                    // Override if 'ADICIONAL' column says SI? - Product Owner said just "Si el CSV trae la OT vacía, inserta una nueva OT"
                    // We can keep the 'ADICIONAL' check if we want to be safe, but pure logic says empty OT = Additional
                    if (row['ADICIONAL'] === 'SI') otData.is_additional = true;

                    const newOt = await this.otRepository.createWithClient(otData, client);
                    otId = newOt.id;
                }

                // 3. Item Logic
                // Normalize description: trim + single space
                const normalizedDesc = rawDesc.trim().replace(/\s+/g, ' ');

                // Exact match lookup
                const itemId = await this.itemRepository.findIdByDescription(normalizedDesc);

                if (!itemId) {
                    throw new Error(`Item no encontrado: '${normalizedDesc}'`);
                }

                // 4. Create Detail
                const itmOtData: ItmOtDTO = {
                    ot_id: otId,
                    item_id: itemId,
                    quantity: parseFloat(row['CANTIDAD']?.replace(',', '.') || '0')
                };

                await this.itmOtRepository.createWithClient(itmOtData, client);

                await client.query('COMMIT');
                successCount++;

            } catch (err: any) {
                await client.query('ROLLBACK');
                failedCount++;
                // Include identifying info for the error
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
}
