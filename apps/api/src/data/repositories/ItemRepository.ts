import { Pool } from 'pg';
import pool from '../../config/database';
import { IItemRepository } from './interfaces/IItemRepository';
import { ItemDTO } from '../dto/ItemDTO';

export class ItemRepository implements IItemRepository {
    private db: Pool;

    constructor() {
        this.db = pool;
    }

    async findAll(): Promise<ItemDTO[]> {
        const result = await this.db.query('SELECT * FROM item');
        return result.rows;
    }

    async findByType(type: string): Promise<ItemDTO[]> {
        const result = await this.db.query('SELECT * FROM item WHERE item_type = $1', [type]);
        return result.rows;
    }

    async findById(id: number): Promise<ItemDTO | null> {
        const result = await this.db.query('SELECT * FROM item WHERE item_id = $1', [id]);
        return result.rows[0] || null;
    }

    async create(item: ItemDTO): Promise<any> {
        const { item_id, description, item_value, item_type, item_unit } = item;
        const sql = 'INSERT INTO item (item_id, description, item_value, item_type, item_unit) VALUES ($1, $2, $3, $4, $5) RETURNING *';
        const result = await this.db.query(sql, [item_id, description, item_value, item_type, item_unit]);
        return result.rows[0];
    }

    async update(id: number, item: Partial<ItemDTO>): Promise<any> {
        const { item_id, description, item_value, item_type, item_unit } = item;
        const sql = 'UPDATE item SET item_id = $1, description = $2, item_value = $3, item_type = $4, item_unit = $5 WHERE item_id = $6 RETURNING *';
        const result = await this.db.query(sql, [item_id, description, item_value, item_type, item_unit, id]);
        return result.rows[0];
    }

    async delete(id: number): Promise<any> {
        const result = await this.db.query('DELETE FROM item WHERE item_id = $1 RETURNING *', [id]);
        return result.rows[0];
    }

    async findIdByDescription(description: string): Promise<number | null> {
        const result = await this.db.query('SELECT item_id FROM item WHERE unaccent(description) ILIKE unaccent($1)', [description]);
        return result.rows[0] ? result.rows[0].item_id : null;
    }
}
