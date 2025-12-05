import { Pool } from 'pg';
import pool from '../../config/database';
import { IDashboardRepository } from './interfaces/IDashboardRepository';
import { MonthValueDTO, ItemTotalDTO, MonthlyYieldDTO } from '../dto/DashboardDTO';

export class DashboardRepository implements IDashboardRepository {
    private db: Pool;

    constructor() {
        this.db = pool;
    }

    async getMonthValue(date1: string, date2: string): Promise<MonthValueDTO> {
        const sql = 'SELECT SUM(itm_ot.quantity * item.item_value) AS total_value FROM itm_ot JOIN item ON itm_ot.item_id = item.item_id WHERE itm_ot.created_at >= $1 AND itm_ot.created_at <= $2;';
        const result = await this.db.query(sql, [date1, date2]);
        return result.rows[0];
    }

    async getTotalOfItem(): Promise<ItemTotalDTO[]> {
        const sql = 'SELECT i.item_id, i.description, COUNT(*) AS repetition_count, SUM(io.quantity) AS total_quantity FROM item AS i JOIN itm_ot AS io ON i.item_id = io.item_id GROUP BY i.item_id, i.description ORDER BY repetition_count DESC';
        const result = await this.db.query(sql);
        return result.rows;
    }

    async getMonthlyYield(): Promise<MonthlyYieldDTO[]> {
        const sql = 'SELECT ot.hydraulic_movil_id, COUNT(itm_ot.item_id) AS item_count FROM ot INNER JOIN itm_ot ON ot.ot_id = itm_ot.ot_id GROUP BY ot.hydraulic_movil_id';
        const result = await this.db.query(sql);
        return result.rows;
    }
}
