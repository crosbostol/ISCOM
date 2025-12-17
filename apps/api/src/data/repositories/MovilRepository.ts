import pool from '../../config/database';
import { IMovilRepository } from './interfaces/IMovilRepository';
import { MovilDTO } from '../dto/MovilDTO';

export interface Movil extends MovilDTO {
    conductor_id: number | null;
    conductor_name?: string;
}

export type CreateMovilDTO = Omit<Movil, 'conductor_name'>;
export type UpdateMovilDTO = Partial<CreateMovilDTO>;

export class MovilRepository implements IMovilRepository {

    async findAll(): Promise<Movil[]> {
        const sql = `
            SELECT 
                m.movil_id, 
                m.external_code, 
                m.movil_type, 
                m.movil_state, 
                m.conductor_id,
                c.name as conductor_name
            FROM movil m
            LEFT JOIN conductor c ON m.conductor_id = c.id
            ORDER BY m.movil_id ASC
        `;
        const result = await pool.query(sql);
        return result.rows;
    }

    async findById(id: string): Promise<Movil | null> {
        const sql = `
            SELECT 
                m.movil_id,
                m.external_code,
                m.inventory_id,
                m.movil_state,
                m.movil_type,
                m.movil_observations,
                m.conductor_id,
                c.name as conductor_name
            FROM movil m
            LEFT JOIN conductor c ON m.conductor_id = c.id
            WHERE m.movil_id = $1
        `;
        const result = await pool.query(sql, [id]);
        return result.rows[0] || null;
    }

    async create(data: CreateMovilDTO): Promise<Movil> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const patente = data.movil_id;
            const inventoryId = patente;

            const checkInv = await client.query('SELECT 1 FROM inventory WHERE inventory_id = $1', [inventoryId]);
            if (checkInv.rowCount === 0) {
                await client.query('INSERT INTO inventory (inventory_id) VALUES ($1)', [inventoryId]);
            }

            const sql = `
                INSERT INTO movil (movil_id, inventory_id, external_code, movil_type, movil_state, conductor_id)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;
            const result = await client.query(sql, [
                patente,         // movil_id
                inventoryId,     // inventory_id
                data.external_code || null, // external_code
                data.movil_type,
                data.movil_state,
                data.conductor_id
            ]);

            await client.query('COMMIT');
            return result.rows[0];

        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    async update(id: string, data: UpdateMovilDTO): Promise<Movil | null> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const fields: string[] = [];
            const values: any[] = [];
            let idx = 1;

            // Handle ID change (Patente update)
            // If data.movil_id is present and different from id (params)
            let newId = id;
            if (data.movil_id && data.movil_id !== id) {
                newId = data.movil_id;
                fields.push(`movil_id = $${idx++}`);
                values.push(newId);

                // Also update inventory_id link to match new Patente
                // 1. Ensure new Inventory exists
                const checkInv = await client.query('SELECT 1 FROM inventory WHERE inventory_id = $1', [newId]);
                if (checkInv.rowCount === 0) {
                    await client.query('INSERT INTO inventory (inventory_id) VALUES ($1)', [newId]);
                }

                fields.push(`inventory_id = $${idx++}`);
                values.push(newId);
            }

            if (data.external_code !== undefined) {
                fields.push(`external_code = $${idx++}`);
                values.push(data.external_code);
            }
            if (data.movil_type !== undefined) {
                fields.push(`movil_type = $${idx++}`);
                values.push(data.movil_type);
            }
            if (data.movil_state !== undefined) {
                fields.push(`movil_state = $${idx++}`);
                values.push(data.movil_state);
            }
            if (data.conductor_id !== undefined) {
                fields.push(`conductor_id = $${idx++}`);
                values.push(data.conductor_id);
            }

            if (fields.length === 0) {
                await client.query('ROLLBACK');
                return this.findById(id);
            }

            values.push(id); // The old ID for WHERE clause
            const sql = `
                UPDATE movil
                SET ${fields.join(', ')}
                WHERE movil_id = $${idx}
                RETURNING *
            `;

            const result = await client.query(sql, values);
            await client.query('COMMIT');
            return result.rows[0] || null;

        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    async delete(id: string): Promise<boolean> {
        const sql = `DELETE FROM movil WHERE movil_id = $1`;
        const result = await pool.query(sql, [id]);
        return (result.rowCount ?? 0) > 0;
    }

    async getMovilOc(): Promise<any[]> {
        const type = 'OBRA CIVIL';
        const sql = `
            SELECT 
                mo.movil_id, 
                co.name 
            FROM movil mo 
            LEFT JOIN conductor co ON mo.conductor_id = co.id 
            WHERE mo.movil_type = $1
        `;
        const result = await pool.query(sql, [type]);
        return result.rows;
    }

    async findByExternalCode(code: string): Promise<Movil | null> {
        const sql = `SELECT * FROM movil WHERE external_code = $1`;
        const result = await pool.query(sql, [code]);
        return result.rows[0] || null;
    }
}
