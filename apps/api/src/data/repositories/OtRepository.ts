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
        // Map legacy ot_id to external_ot_id if needed
        let { external_ot_id } = ot;
        if (!external_ot_id && ot['ot_id']) {
            external_ot_id = ot['ot_id'];
        }

        // Destructure to separate columns from non-columns (items)
        // 'items' array must NOT be included in the SQL INSERT for 'ot' table
        const { is_additional, items, ...rest } = ot as any;

        // Exclude properties that are not columns or handled above
        const { ot_id, id, ...otherFields } = rest;
        // Make sure we don't duplicate external_ot_id in otherFields if it was there
        if ('external_ot_id' in otherFields) delete otherFields['external_ot_id'];

        const calculatedAdditional = is_additional || !external_ot_id;

        const columns = ["external_ot_id", "is_additional", ...Object.keys(otherFields)];
        const values = [external_ot_id || null, calculatedAdditional, ...Object.values(otherFields)];

        const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
        const columnNames = columns.join(", ");

        const query = `INSERT INTO ot (${columnNames}) VALUES (${placeholders}) RETURNING *`;

        const result = await this.db.query(query, values);
        return result.rows[0];
    }

    async findAll(): Promise<OrdenTrabajoDTO[]> {
        const result = await this.db.query('SELECT * FROM ot ORDER BY id DESC');
        return result.rows;
    }

    async findById(id: number): Promise<OrdenTrabajoDTO | null> {
        const result = await this.db.query('SELECT * FROM ot WHERE id = $1', [id]);
        const ot = result.rows[0];
        if (!ot) return null;

        const itemsResult = await this.db.query(`
            SELECT io.item_id, io.quantity, i.description, i.item_type, i.item_value 
            FROM itm_ot io 
            JOIN item i ON io.item_id = i.item_id 
            WHERE io.ot_id = $1
        `, [id]);

        ot.items = itemsResult.rows;
        return ot;
    }

    async findByExternalId(external_id: string): Promise<OrdenTrabajoDTO | null> {
        const result = await this.db.query('SELECT * FROM ot WHERE external_ot_id = $1', [external_id]);
        return result.rows[0] || null;
    }

    async findByAddress(street: string, number: string, commune: string): Promise<OrdenTrabajoDTO[]> {
        const query = `
            SELECT * FROM ot 
            WHERE LOWER(street) = LOWER($1) 
            AND number_street = $2 
            AND LOWER(commune) = LOWER($3) 
            AND dismissed = false
        `;
        const result = await this.db.query(query, [street, number, commune]);
        return result.rows;
    }

    async update(id: number, ot: Partial<OrdenTrabajoDTO>): Promise<any> {
        // Exclude fields that are not columns in OT table
        const { items, debris_date, ...updateData } = ot as any;

        const fields = Object.keys(updateData).filter(k => k !== 'id' && k !== 'ot_id'); // Don't update PK
        const values = fields.map(k => updateData[k]);

        if (fields.length === 0) return null;

        const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(", ");
        const query = `UPDATE ot SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`;

        const result = await this.db.query(query, [...values, id]);
        return result.rows[0];
    }

    async softDelete(id: number): Promise<any> {
        const query = 'UPDATE ot SET dismissed = TRUE WHERE id = $1 AND dismissed = false RETURNING *';
        const result = await this.db.query(query, [id]);
        return result.rows[0];
    }

    async getOtTable(limit?: number, offset?: number): Promise<any[]> {
        const paginationClause = (limit && offset !== undefined) ? `LIMIT ${limit} OFFSET ${offset}` : '';
        const query = `
            SELECT 
                o.id,
                o.external_ot_id,
                o.is_additional,
                o.started_at, 
                o.finished_at, 
                o.street, 
                o.number_street,
                o.commune, 
                o.hydraulic_movil_id, 
                c.name as N_hidraulico, 
                o.civil_movil_id, 
                c2.name as N_civil,
                o.civil_work_at, 
                o.ot_state 
            FROM OT o 
            LEFT JOIN MOVIL m1 ON o.hydraulic_movil_id = m1.movil_id 
            LEFT JOIN MOVIL m2 ON o.civil_movil_id = m2.movil_id 
            LEFT JOIN CONDUCTOR c ON m1.movil_id = c.movil_id 
            LEFT JOIN CONDUCTOR c2 On m2.movil_id = c2.movil_id
            ORDER BY 
                CASE 
                    WHEN o.ot_state = 'PENDIENTE_OC' 
                        AND o.started_at <= NOW() - INTERVAL '3 days' 
                    THEN 1 
                    ELSE 0 
                END DESC,
                o.started_at ASC NULLS LAST
            ${paginationClause}
        `;
        const result = await this.db.query(query);
        return result.rows;
    }

    async getOtTableByState(state: string): Promise<any[]> {
        const query = `
            SELECT 
                o.id,
                o.external_ot_id,
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

    async createWithClient(ot: OrdenTrabajoDTO, client: any): Promise<any> {
        let { external_ot_id } = ot;
        if (!external_ot_id && ot['ot_id']) {
            external_ot_id = ot['ot_id'];
        }

        // Destructure items to exclude from INSERT
        const { is_additional, items, ...rest } = ot as any;
        const { ot_id, id, ...otherFields } = rest;
        if ('external_ot_id' in otherFields) delete otherFields['external_ot_id'];

        const calculatedAdditional = is_additional || !external_ot_id;

        const columns = ["external_ot_id", "is_additional", ...Object.keys(otherFields)];
        const values = [external_ot_id || null, calculatedAdditional, ...Object.values(otherFields)];

        const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
        const columnNames = columns.join(", ");

        const query = `INSERT INTO ot (${columnNames}) VALUES (${placeholders}) RETURNING *`;

        const result = await client.query(query, values);
        return result.rows[0];
    }
    async updateWithClient(id: number, ot: Partial<OrdenTrabajoDTO>, client: any): Promise<any> {
        const fields = Object.keys(ot).filter(k => k !== 'id' && k !== 'ot_id');
        const values = fields.map(k => ot[k]);

        if (fields.length === 0) return null;

        const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(", ");
        const query = `UPDATE ot SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`;

        const result = await client.query(query, [...values, id]);
        return result.rows[0];
    }

    async updateMovil(id: number, hydraulicId: string | null, civilId: string | null, client: any): Promise<void> {
        const query = `
            UPDATE ot 
            SET 
                hydraulic_movil_id = COALESCE($2, hydraulic_movil_id),
                civil_movil_id = COALESCE($3, civil_movil_id)
            WHERE id = $1
        `;
        await client.query(query, [id, hydraulicId, civilId]);
    }

    async updateMovilAndDates(id: number, hydraulicId: string | null, civilId: string | null, startedAt: Date | undefined, civilDate: Date | undefined, client: any): Promise<void> {
        const query = `
            UPDATE ot 
            SET 
                hydraulic_movil_id = COALESCE($2, hydraulic_movil_id),
                civil_movil_id = COALESCE($3, civil_movil_id),
                started_at = COALESCE($4, started_at),
                civil_work_at = COALESCE($5, civil_work_at)
            WHERE id = $1
        `;
        await client.query(query, [id, hydraulicId, civilId, startedAt, civilDate]);
    }
}
