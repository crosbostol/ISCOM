import pool from '../../config/database';
import { IItemRepository } from './interfaces/IItemRepository';
import { ItemDTO, CreateItemDTO, UpdateItemDTO } from '../dto/ItemDTO';

export class ItemRepository implements IItemRepository {

    async findAll(): Promise<ItemDTO[]> {
        const sql = `
            SELECT item_id, description, item_value, item_type, item_unit
            FROM item
            ORDER BY item_id ASC
        `;
        const result = await pool.query(sql);
        // Postgres numeric returns as string for item_value. item_id is integer (number).
        return result.rows.map(row => ({
            ...row,
            item_value: parseFloat(row.item_value)
        }));
    }

    async findById(id: number): Promise<ItemDTO | null> {
        const sql = `
            SELECT item_id, description, item_value, item_type, item_unit
            FROM item
            WHERE item_id = $1
        `;
        const result = await pool.query(sql, [id]);
        if (result.rows.length === 0) return null;

        const row = result.rows[0];
        return {
            ...row,
            item_value: parseFloat(row.item_value)
        };
    }

    async create(data: CreateItemDTO): Promise<ItemDTO> {
        // ID is auto-generated (SERIAL)
        const sql = `
            INSERT INTO item (description, item_value, item_type, item_unit)
            VALUES ($1, $2, $3, $4)
            RETURNING item_id, description, item_value, item_type, item_unit
        `;
        const result = await pool.query(sql, [
            data.description,
            data.item_value,
            data.item_type || null,
            data.item_unit || null
        ]);
        const row = result.rows[0];
        return {
            ...row,
            item_value: parseFloat(row.item_value)
        };
    }

    async update(id: number, data: UpdateItemDTO): Promise<ItemDTO | null> {
        const fields: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if (data.description !== undefined) {
            fields.push(`description = $${idx++}`);
            values.push(data.description);
        }
        if (data.item_value !== undefined) {
            fields.push(`item_value = $${idx++}`);
            values.push(data.item_value);
        }
        if (data.item_type !== undefined) {
            fields.push(`item_type = $${idx++}`);
            values.push(data.item_type);
        }
        if (data.item_unit !== undefined) {
            fields.push(`item_unit = $${idx++}`);
            values.push(data.item_unit);
        }

        if (fields.length === 0) return this.findById(id);

        values.push(id);
        const sql = `
            UPDATE item
            SET ${fields.join(', ')}
            WHERE item_id = $${idx}
            RETURNING item_id, description, item_value, item_type, item_unit
        `;

        const result = await pool.query(sql, values);
        if (result.rows.length === 0) return null;

        const row = result.rows[0];
        return {
            ...row,
            item_value: parseFloat(row.item_value)
        };
    }

    async delete(id: number): Promise<boolean> {
        const sql = `DELETE FROM item WHERE item_id = $1`;
        const result = await pool.query(sql, [id]);
        return (result.rowCount ?? 0) > 0;
    }

    async findIdByDescription(description: string): Promise<number | null> {
        const sql = `SELECT item_id FROM item WHERE description = $1`;
        const result = await pool.query(sql, [description]);
        if (result.rows.length === 0) return null;
        return result.rows[0].item_id;
    }
}
