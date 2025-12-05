import { Pool } from 'pg';
import pool from '../../config/database';
import { IOtRepository } from './interfaces/IOtRepository';
import { OrdenTrabajoDTO } from '../dto/OrdenTrabajoDTO';

export class OtRepository implements IOtRepository {
    private db: Pool;

    constructor() {
        this.db = pool;
    }

    async create(ot: OrdenTrabajoDTO): Promise<any> {
        const fields = Object.keys(ot);
        const values = Object.values(ot);

        // Construct parameterized query dynamically
        const columns = fields.join(", ");
        const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");

        const query = `INSERT INTO ot (${columns}) VALUES (${placeholders}) RETURNING *`;

        const result = await this.db.query(query, values);
        return result.rows[0];
    }

    async findAll(): Promise<OrdenTrabajoDTO[]> {
        const result = await this.db.query('SELECT * FROM ot');
        return result.rows;
    }

    async findById(id: string): Promise<OrdenTrabajoDTO | null> {
        const result = await this.db.query('SELECT * FROM ot WHERE ot_id = $1', [id]);
        return result.rows[0] || null;
    }

    async update(id: string, ot: Partial<OrdenTrabajoDTO>): Promise<any> {
        const fields = Object.keys(ot);
        const values = Object.values(ot);

        if (fields.length === 0) return null;

        const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(", ");
        const query = `UPDATE ot SET ${setClause} WHERE ot_id = $${fields.length + 1} RETURNING *`;

        const result = await this.db.query(query, [...values, id]);
        return result.rows[0];
    }

    async softDelete(id: string): Promise<any> {
        const query = 'UPDATE ot SET dismissed = TRUE WHERE ot_id = $1 AND dismissed = false RETURNING *';
        const result = await this.db.query(query, [id]);
        return result.rows[0];
    }
}
