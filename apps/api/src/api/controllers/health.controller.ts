import { Request, Response } from 'express';
import pool from '../../config/database';

export const getHealth = async (req: Request, res: Response) => {
    try {
        // Optional: Check database connection
        await pool.query('SELECT 1');
        res.status(200).json({
            status: 'UP',
            timestamp: new Date().toISOString(),
            database: 'CONNECTED'
        });
    } catch (error) {
        res.status(503).json({
            status: 'DOWN',
            timestamp: new Date().toISOString(),
            database: 'DISCONNECTED',
            error: error
        });
    }
};
