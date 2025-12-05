import { Pool } from 'pg';
import pool from '../../config/database';
import { IConductorRepository } from './interfaces/IConductorRepository';
import { ConductorDTO } from '../dto/ConductorDTO';

export class ConductorRepository implements IConductorRepository {
    private db: Pool;

    constructor() {
        this.db = pool;
    }

    async findAll(): Promise<ConductorDTO[]> {
        const result = await this.db.query('SELECT * FROM conductor');
        return result.rows;
    }

    async findById(id: number): Promise<ConductorDTO | null> {
        const result = await this.db.query('SELECT * FROM conductor WHERE conductor_id = $1', [id]);
        return result.rows[0] || null;
    }

    async create(conductor: ConductorDTO): Promise<any> {
        const { conductor_id, movil_id } = conductor;
        const result = await this.db.query('INSERT INTO conductor (conductor_id, movil_id) VALUES ($1, $2) RETURNING *', [conductor_id, movil_id]);
        return result.rows[0];
    }

    async delete(id: number): Promise<any> {
        const result = await this.db.query('DELETE FROM conductor WHERE conductor_id = $1 RETURNING *', [id]);
        return result.rows[0];
    }

    async update(id: number, conductor: Partial<ConductorDTO>): Promise<any> {
        const { conductor_id, movil_id } = conductor;
        const result = await this.db.query('UPDATE conductor SET movil_id = $1, conductor_id = $2 WHERE conductor_id = $3 RETURNING *', [movil_id, conductor_id, id]);
        return result.rows[0];
    }
}
