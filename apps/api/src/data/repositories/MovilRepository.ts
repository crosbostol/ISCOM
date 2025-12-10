import { Pool } from 'pg';
import pool from '../../config/database';
import { IMovilRepository } from './interfaces/IMovilRepository';
import { MovilDTO } from '../dto/MovilDTO';

export class MovilRepository implements IMovilRepository {
    private db: Pool;

    constructor() {
        this.db = pool;
    }

    async findAll(): Promise<MovilDTO[]> {
        const result = await this.db.query('SELECT * FROM movil');
        return result.rows;
    }

    async findById(id: number): Promise<MovilDTO | null> {
        const result = await this.db.query('SELECT * FROM movil WHERE movil_id = $1', [id]);
        return result.rows[0] || null;
    }

    async create(movil: MovilDTO): Promise<any> {
        const { movil_id, inventory_id, movil_observations, movil_type } = movil;
        const sql = 'INSERT INTO movil (movil_id, inventory_id, movil_observations, movil_type) VALUES ($1, $2, $3, $4) RETURNING *';
        const result = await this.db.query(sql, [movil_id, inventory_id, movil_observations, movil_type]);
        return result.rows[0];
    }

    async delete(id: number): Promise<any> {
        const result = await this.db.query('DELETE FROM movil WHERE movil_id = $1 RETURNING *', [id]);
        return result.rows[0];
    }

    async update(id: number, movil: Partial<MovilDTO>): Promise<any> {
        const { movil_id, inventory_id, movil_state, movil_observations, movil_type } = movil;
        const sql = 'UPDATE movil SET movil_id = $1, inventory_id = $2, movil_state = $3, movil_observations = $4, movil_type = $5 WHERE movil_id = $6 RETURNING *';
        const result = await this.db.query(sql, [movil_id, inventory_id, movil_state, movil_observations, movil_type, id]);
        return result.rows[0];
    }

    async getMovilOc(): Promise<any[]> {
        const type = 'OBRA CIVIL';
        const sql = `SELECT mo.movil_id, co.name FROM movil mo LEFT JOIN conductor co ON co.movil_id = mo.movil_id WHERE mo.movil_type = $1`;
        const result = await this.db.query(sql, [type]);
        return result.rows;
    }

    async findByExternalCode(code: string): Promise<MovilDTO | null> {
        const result = await this.db.query('SELECT * FROM movil WHERE external_code = $1', [code]);
        return result.rows[0] || null;
    }
}
