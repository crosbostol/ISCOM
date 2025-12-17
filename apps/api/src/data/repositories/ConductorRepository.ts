import pool from '../../config/database';

export interface Conductor {
    id: number;
    name: string;
    rut: string;
}

export type CreateConductorDTO = Omit<Conductor, 'id'>;
export type UpdateConductorDTO = Partial<CreateConductorDTO>;

export class ConductorRepository {

    async findAll(): Promise<Conductor[]> {
        const sql = `
            SELECT id, name, rut
            FROM conductor
            ORDER BY id ASC
        `;
        const result = await pool.query(sql);
        return result.rows;
    }

    async findById(id: number): Promise<Conductor | null> {
        const sql = `
            SELECT id, name, rut
            FROM conductor
            WHERE id = $1
        `;
        const result = await pool.query(sql, [id]);
        return result.rows[0] || null;
    }

    async findByRut(rut: string): Promise<Conductor | null> {
        const sql = `
            SELECT id, name, rut
            FROM conductor
            WHERE rut = $1
        `;
        const result = await pool.query(sql, [rut]);
        return result.rows[0] || null;
    }

    async create(data: CreateConductorDTO): Promise<Conductor> {
        const sql = `
            INSERT INTO conductor (name, rut)
            VALUES ($1, $2)
            RETURNING id, name, rut
        `;
        const result = await pool.query(sql, [data.name, data.rut]);
        return result.rows[0];
    }

    async update(id: number, data: UpdateConductorDTO): Promise<Conductor | null> {
        // Build dynamic query
        const fields: string[] = [];
        const values: any[] = [];
        let idx = 1;

        if (data.name !== undefined) {
            fields.push(`name = $${idx++}`);
            values.push(data.name);
        }
        if (data.rut !== undefined) {
            fields.push(`rut = $${idx++}`);
            values.push(data.rut);
        }

        if (fields.length === 0) return this.findById(id);

        values.push(id);
        const sql = `
            UPDATE conductor
            SET ${fields.join(', ')}
            WHERE id = $${idx}
            RETURNING id, name, rut
        `;

        const result = await pool.query(sql, values);
        return result.rows[0] || null;
    }

    async delete(id: number): Promise<boolean> {


        const sql = `DELETE FROM conductor WHERE id = $1`;
        const result = await pool.query(sql, [id]);
        return (result.rowCount ?? 0) > 0;
    }
}
