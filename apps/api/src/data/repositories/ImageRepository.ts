import { Pool } from 'pg';
import pool from '../../config/database';
import { IImageRepository } from './interfaces/IImageRepository';
import { ImageDTO } from '../dto/ImageDTO';

export class ImageRepository implements IImageRepository {
    private db: Pool;

    constructor() {
        this.db = pool;
    }

    async findByOtId(ot_id: string): Promise<ImageDTO[]> {
        const result = await this.db.query('SELECT * FROM image WHERE ot_id = $1', [ot_id]);
        return result.rows;
    }

    async create(image: ImageDTO): Promise<any> {
        const { url, ot_id } = image;
        const result = await this.db.query('INSERT INTO image (url, ot_id) VALUES ($1, $2) RETURNING *', [url, ot_id]);
        return result.rows[0];
    }

    async findById(image_id: number): Promise<ImageDTO | null> {
        // Fixed potential bug: Legacy code queried 'item', assuming 'image' is correct.
        const result = await this.db.query('SELECT * FROM image WHERE image_id = $1', [image_id]);
        return result.rows[0] || null;
    }

    async delete(image_id: number): Promise<any> {
        const result = await this.db.query('DELETE FROM image WHERE image_id = $1 RETURNING *', [image_id]);
        return result.rows[0];
    }

    async update(image_id: number, url: string): Promise<any> {
        const result = await this.db.query('UPDATE image SET url = $1 WHERE image_id = $2 RETURNING *', [url, image_id]);
        return result.rows[0];
    }
}
