import { Pool } from 'pg';
import pool from '../../config/database';
import { IInventoryRepository } from './interfaces/IInventoryRepository';
import { InventoryDTO } from '../dto/InventoryDTO';

export class InventoryRepository implements IInventoryRepository {
    private db: Pool;

    constructor() {
        this.db = pool;
    }

    async create(inventory: InventoryDTO): Promise<any> {
        const { inventory_id } = inventory;
        const result = await this.db.query('INSERT INTO inventory (inventory_id) VALUES ($1) RETURNING *', [inventory_id]);
        return result.rows[0];
    }

    async findAll(): Promise<any[]> {
        const sql = 'SELECT inv.inventory_id, pro.product_id, pro.product_name, inv_pro.quantity FROM inventory inv INNER JOIN inv_pro ON inv_pro.inventory_id = inv.inventory_id INNER JOIN product pro ON pro.product_id = inv_pro.product_id';
        const result = await this.db.query(sql);
        return result.rows;
    }

    async getUnique(): Promise<InventoryDTO[]> {
        const result = await this.db.query('SELECT inventory_id FROM inventory');
        return result.rows;
    }

    async findById(id: number): Promise<any[]> {
        const sql = 'SELECT inv.inventory_id, pro.product_id, pro.product_name, inv_pro.quantity, pro.product_unit, pro.product_category FROM inventory inv INNER JOIN inv_pro ON inv_pro.inventory_id = inv.inventory_id INNER JOIN product pro ON pro.product_id = inv_pro.product_id WHERE inv.inventory_id = $1';
        const result = await this.db.query(sql, [id]);
        return result.rows;
    }

    async delete(id: number): Promise<any> {
        const result = await this.db.query('DELETE FROM inventory WHERE inventory_id = $1 RETURNING *', [id]);
        return result.rows[0];
    }

    async update(id: number, inventory: InventoryDTO): Promise<any> {
        const { inventory_id } = inventory;
        const sql = 'UPDATE inventory SET inventory_id = $1 WHERE inventory_id = $2 RETURNING *';
        const result = await this.db.query(sql, [inventory_id, id]);
        return result.rows[0];
    }
}
