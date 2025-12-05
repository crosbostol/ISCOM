import { Pool } from 'pg';
import pool from '../../config/database';
import { IProOtRepository } from './interfaces/IProOtRepository';
import { ProOtDTO } from '../dto/ProOtDTO';

export class ProOtRepository implements IProOtRepository {
    private db: Pool;

    constructor() {
        this.db = pool;
    }

    async findByOtId(otId: string): Promise<ProOtDTO[]> {
        const result = await this.db.query('SELECT * FROM pro_ot WHERE ot_id = $1', [otId]);
        return result.rows;
    }

    async findByProductId(productId: number): Promise<ProOtDTO[]> {
        const result = await this.db.query('SELECT * FROM pro_ot WHERE product_id = $1', [productId]);
        return result.rows;
    }

    async create(proOt: ProOtDTO): Promise<any> {
        const { ot_id, product_id, quantity, inventory_id } = proOt;
        const sql = 'INSERT INTO pro_ot (ot_id, product_id, quantity, inventory_id) VALUES ($1, $2, $3, $4) RETURNING *';
        const result = await this.db.query(sql, [ot_id, product_id, quantity, inventory_id]);
        return result.rows[0];
    }

    async delete(otId: string, productId: number): Promise<any> {
        const sql = 'DELETE FROM pro_ot WHERE ot_id = $1 AND product_id = $2 RETURNING *';
        const result = await this.db.query(sql, [otId, productId]);
        return result.rows[0];
    }

    async update(otId: string, productId: number, quantity: number): Promise<any> {
        const sql = 'UPDATE pro_ot SET quantity = $1 WHERE ot_id = $2 AND product_id = $3 RETURNING *';
        const result = await this.db.query(sql, [quantity, otId, productId]);
        return result.rows[0];
    }
}
