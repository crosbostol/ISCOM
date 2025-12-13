import { Pool } from 'pg';
import pool from '../../config/database';
import { IItmOtRepository } from './interfaces/IItmOtRepository';
import { ItmOtDTO } from '../dto/ItmOtDTO';

export class ItmOtRepository implements IItmOtRepository {
    private db: Pool;

    constructor() {
        this.db = pool;
    }

    async findAll(): Promise<ItmOtDTO[]> {
        const sql = 'SELECT *, itm_ot.quantity * item.item_value AS item_Total FROM itm_ot INNER JOIN item ON item.item_id = itm_ot.item_id';
        const result = await this.db.query(sql);
        return result.rows;
    }

    async findByOtId(otId: number): Promise<ItmOtDTO[]> {
        const sql = 'SELECT *, itm_ot.quantity * item.item_value AS item_Total FROM itm_ot INNER JOIN item ON item.item_id = itm_ot.item_id WHERE itm_ot.ot_id = $1';
        const result = await this.db.query(sql, [otId]);
        return result.rows;
    }

    async findByOtIdAndType(otId: number, type: string): Promise<ItmOtDTO[]> {
        const sql = 'SELECT *, itm_ot.quantity * item.item_value AS item_Total FROM itm_ot INNER JOIN item ON item.item_id = itm_ot.item_id WHERE itm_ot.ot_id = $1 AND item.item_type = $2';
        const result = await this.db.query(sql, [otId, type]);
        return result.rows;
    }

    async create(itmOt: ItmOtDTO): Promise<any> {
        const { item_id, ot_id, quantity } = itmOt;
        const sql = 'INSERT INTO itm_ot (item_id, ot_id, quantity) VALUES ($1, $2, $3) RETURNING *';
        const result = await this.db.query(sql, [item_id, ot_id, quantity]);
        return result.rows[0];
    }

    async delete(itemId: number, otId: number): Promise<any> {
        const sql = 'DELETE FROM itm_ot WHERE item_id = $1 AND ot_id = $2 RETURNING *';
        const result = await this.db.query(sql, [itemId, otId]);
        return result.rows[0];
    }

    async update(itemId: number, otId: number, quantity: number): Promise<any> {
        const sql = 'UPDATE itm_ot SET quantity = $1 WHERE item_id = $2 AND ot_id = $3 RETURNING *';
        const result = await this.db.query(sql, [quantity, itemId, otId]);
        return result.rows[0];
    }

    async createWithClient(itmOt: ItmOtDTO, client: any): Promise<any> {
        const { item_id, ot_id, quantity } = itmOt;
        const sql = 'INSERT INTO itm_ot (item_id, ot_id, quantity) VALUES ($1, $2, $3) RETURNING *';
        const result = await client.query(sql, [item_id, ot_id, quantity]);
        return result.rows[0];
    }

    async deleteAllByOtId(otId: number): Promise<void> {
        const sql = 'DELETE FROM itm_ot WHERE ot_id = $1';
        await this.db.query(sql, [otId]);
    }
}
