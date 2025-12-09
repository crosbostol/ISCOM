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
        const results: any[] = [];
        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', async () => {
                    try {
                        const result = await this.processGroupedRows(results);
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    } finally {
                        // Clean up file
                        fs.unlinkSync(filePath);
                    }
                })
                .on('error', (error) => {
                    fs.unlinkSync(filePath);
                    reject(error);
                });
        });
    }

    private getGroupingKey(row: any): string {
        const otCode = row['OT']?.trim();
        const address = row['DIRECCIÓN']?.trim().toUpperCase();
        const number = row['NUMERAL']?.trim();
        const commune = row['COMUNA']?.trim().toUpperCase();

        if (otCode && otCode.length > 0) {
            return `EXT:${otCode}`;
        } else {
            if (!address || !number || !commune) {
                // Return a special error key or throw? Throwing might abort all. 
                // Better to return specific error key or just throw to fail this row group.
                // User said: "throw new Error"
                throw new Error(`Fila sin OT y sin dirección completa: ${JSON.stringify(row)}`);
            }
            return `LOC:${address}|${number}|${commune}`;
        }
    }

    private async processGroupedRows(rows: any[]): Promise<any> {
        // 1. Grouping
        const groups: { [key: string]: any[] } = {};
        const errors: any[] = [];

        for (const row of rows) {
            try {
                const key = this.getGroupingKey(row);
                if (!groups[key]) groups[key] = [];
                groups[key].push(row);
            } catch (err: any) {
                errors.push({ row, reason: err.message });
            }
        }

        let totalProcessed = 0;
        let successCount = 0;
        let failedCount = 0;

        // 2. Iterate Keys
        for (const key of Object.keys(groups)) {
            const groupRows = groups[key];
            totalProcessed++;

            const client = await pool.connect();

            try {
                await client.query('BEGIN');

                // A. Header Creation
                const firstRow = groupRows[0];
                let external_ot_id: string | null = null;
                let is_additional = false;

                if (key.startsWith('EXT:')) {
                    external_ot_id = key.substring(4);
                } else {
                    is_additional = true; // LOC: => additional
                }

                // Override if CSV says ADICIONAL = SI
                if (firstRow['ADICIONAL'] === 'SI') is_additional = true;

                // Lookup Movils
                // Use repositories directly (read-only doesn't strictly need transaction lock unless we want repeatable read)
                const movilCode = firstRow['MÓVIL'];
                let hydraulic_movil_id: number | null = null;
                // Note: user said "movil_Id" in CSV lookup. assuming MÓVIL column holds external_code.
                if (movilCode) {
                    const movil = await this.movilRepository.findByExternalCode(movilCode);
                    // Assuming we assign to hydraulic first? User said "OT.hydraulic_movil_id (o civil según corresponda)" but logic isn't specific.
                    // Making a safe assumption to default to hydraulic if simple.
                    // Or check CSV header mapping more closely? User: "Guardar el ID interno (movil_Id) en OT.hydraulic_movil_id (o civil según corresponda)"
                    if (movil) hydraulic_movil_id = movil.movil_id;
                }

                // Prepare OT DTO
                const otData: any = {
                    external_ot_id,
                    is_additional,
                    street: firstRow['DIRECCIÓN']?.trim().toUpperCase(),
                    number_street: parseNumberStreet(firstRow['NUMERAL']),
                    commune: firstRow['COMUNA']?.trim().toUpperCase(),
                    started_at: parseChileanDate(firstRow['FECHA']), // Assuming 'FECHA' is started_at? User: "started_at: Parsear fecha formato dd-mm-YYYY"
                    hydraulic_movil_id,
                    // Defaults
                    ot_state: 'CREADA',
                    received_at: new Date()
                };

                // Insert OT
                const createdOt = await this.otRepository.createWithClient(otData, client);

                // B. Details Creation
                for (const row of groupRows) {
                    const desc = row['DESCRIPCIÓN']; // Check CSV header? User: "CSV trae descripción"
                    if (!desc) throw new Error("Item sin descripción");

                    const itemId = await this.itemRepository.findIdByDescription(desc);
                    if (!itemId) throw new Error(`Item no encontrado: ${desc}`);

                    const itmOtData: ItmOtDTO = {
                        ot_id: createdOt.id, // Using the SERIAL id
                        item_id: itemId,
                        quantity: parseFloat(row['CANTIDAD']?.replace(',', '.') || '0')
                    };

                    await this.itmOtRepository.createWithClient(itmOtData, client);
                }

                await client.query('COMMIT');
                successCount++;

            } catch (err: any) {
                await client.query('ROLLBACK');
                failedCount++;
                errors.push({ key, reason: err.message });
            } finally {
                client.release(); // CRITICAL
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
