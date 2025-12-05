import { Pool } from 'pg';
import pool from '../../config/database';
import { IInvProRepository } from './interfaces/IInvProRepository';
import { InvProDTO } from '../dto/InvProDTO';

export class InvProRepository implements IInvProRepository {
    private db: Pool;

    constructor() {
        this.db = pool;
    }

    async findAll(): Promise<InvProDTO[]> {
        const sql = 'SELECT inv_pro.*, product.product_name FROM inv_pro JOIN product ON inv_pro.product_id = product.product_id';
        const result = await this.db.query(sql);
        return result.rows;
    }

    async getTotalOfProduct(productId: number): Promise<any> {
        const sql = 'SELECT SUM(quantity) FROM inv_pro WHERE product_id = $1';
        const result = await this.db.query(sql, [productId]);
        return result.rows;
    }

    async create(invPro: InvProDTO): Promise<any> {
        const { product_id, inventory_id, quantity } = invPro;
        const sql = 'INSERT INTO inv_pro (product_id, inventory_id, quantity) VALUES ($1, $2, $3) RETURNING *';
        const result = await this.db.query(sql, [product_id, inventory_id, quantity]);
        return result.rows[0];
    }

    async findById(productId: number, inventoryId: number): Promise<InvProDTO[]> {
        const sql = 'SELECT * FROM inv_pro WHERE product_id = $1 AND inventory_id = $2';
        const result = await this.db.query(sql, [productId, inventoryId]);
        return result.rows;
    }

    async findByInventoryId(inventoryId: number): Promise<InvProDTO[]> {
        const sql = 'SELECT * FROM inv_pro WHERE inventory_id = $1';
        const result = await this.db.query(sql, [inventoryId]);
        return result.rows;
    }

    async delete(productId: number, inventoryId: number): Promise<any> {
        const sql = 'DELETE FROM inv_pro WHERE product_id = $1 AND inventory_id = $2 RETURNING *';
        const result = await this.db.query(sql, [productId, inventoryId]);
        return result.rows[0];
    }

    async update(productId: number, inventoryId: number, quantity: number): Promise<any> {
        const sql = 'UPDATE inv_pro SET quantity = $1 WHERE product_id = $2 AND inventory_id = $3 RETURNING *';
        const result = await this.db.query(sql, [quantity, productId, inventoryId]);
        return result.rows[0];
    }

    async getProductsNotInInventory(inventoryId: number): Promise<any[]> {
        const sql = 'SELECT product_id, product_name, product_category, product_unit FROM product WHERE product_id NOT IN (SELECT product_id FROM inv_pro WHERE inventory_id = $1)';
        const result = await this.db.query(sql, [inventoryId]);
        return result.rows;
    }
}
