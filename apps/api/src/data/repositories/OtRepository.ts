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

    async getOtTable(): Promise<any[]> {
        const query = `
            SELECT 
                o.started_at, 
                o.finished_at, 
                o.ot_id, 
                o.street, 
                o.number_street,
                o.commune, 
                o.hydraulic_movil_id, 
                c.name as N_hidraulico, 
                o.civil_movil_id, 
                c2.name as N_civil, 
                o.ot_state 
            FROM OT o 
            LEFT JOIN MOVIL m1 ON o.hydraulic_movil_id = m1.movil_id 
            LEFT JOIN MOVIL m2 ON o.civil_movil_id = m2.movil_id 
            LEFT JOIN CONDUCTOR c ON m1.movil_id = c.movil_id 
            LEFT JOIN CONDUCTOR c2 On m2.movil_id = c2.movil_id
        `;
        const result = await this.db.query(query);
        return result.rows;
    }

    async getOtTableByState(state: string): Promise<any[]> {
        const query = `
            SELECT 
                o.ot_id, 
                o.street, 
                o.number_street,
                o.commune, 
                o.hydraulic_movil_id, 
                c.name as N_hidraulico, 
                o.civil_movil_id, 
                c2.name as N_civil, 
                o.ot_state 
            FROM OT o 
            LEFT JOIN MOVIL m1 ON o.hydraulic_movil_id = m1.movil_id 
            LEFT JOIN MOVIL m2 ON o.civil_movil_id = m2.movil_id 
            LEFT JOIN CONDUCTOR c ON m1.movil_id = c.movil_id 
            LEFT JOIN CONDUCTOR c2 On m2.movil_id = c2.movil_id 
            WHERE o.ot_state = $1
        `;
        const result = await this.db.query(query, [state]);
        return result.rows;
    }

    async findByRangeDate(start: string, end: string): Promise<OrdenTrabajoDTO[]> {
        const query = 'SELECT * FROM ot WHERE finished_at BETWEEN $1 AND $2 AND dismissed = false';
        const result = await this.db.query(query, [start, end]);
        return result.rows;
    }

    async findByState(state: string): Promise<OrdenTrabajoDTO[]> {
        const query = 'SELECT * FROM ot WHERE ot_state = $1 AND dismissed = false';
        const result = await this.db.query(query, [state]);
        return result.rows;
    }

    async findRejected(): Promise<OrdenTrabajoDTO[]> {
        const query = "SELECT * FROM ot WHERE ot_state = 'RECHAZADA' AND dismissed = false";
        const result = await this.db.query(query);
        return result.rows;
    }
}
