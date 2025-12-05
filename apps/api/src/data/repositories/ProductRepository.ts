import { Pool } from 'pg';
import pool from '../../config/database';
import { IProductRepository } from './interfaces/IProductRepository';
import { ProductDTO } from '../dto/ProductDTO';

export class ProductRepository implements IProductRepository {
    private db: Pool;

    constructor() {
        this.db = pool;
    }

    async findAll(): Promise<ProductDTO[]> {
        const product_type = 'HIDRAULICO'; // Legacy logic filtered by this
        const result = await this.db.query('SELECT * FROM product WHERE product_category = $1', [product_type]);
        return result.rows;
    }

    async findById(id: number): Promise<ProductDTO | null> {
        const result = await this.db.query('SELECT * FROM product WHERE product_id = $1', [id]);
        return result.rows[0] || null;
    }

    async create(product: ProductDTO): Promise<any> {
        const { product_name, product_category, product_unit } = product;
        const sql = 'INSERT INTO product (product_name, product_category, product_unit) VALUES ($1, $2, $3) RETURNING *';
        const result = await this.db.query(sql, [product_name, product_category, product_unit]);
        return result.rows[0];
    }

    async update(id: number, product: Partial<ProductDTO>): Promise<any> {
        const { product_id, product_name, product_category, product_unit } = product;
        const sql = 'UPDATE product SET product_id = $1, product_name = $2, product_category = $3, product_unit = $4 WHERE product_id = $5 RETURNING *';
        const result = await this.db.query(sql, [product_id, product_name, product_category, product_unit, id]);
        return result.rows[0];
    }

    async delete(id: number): Promise<any> {
        const result = await this.db.query('DELETE FROM product WHERE product_id = $1 RETURNING *', [id]);
        return result.rows[0];
    }
}
