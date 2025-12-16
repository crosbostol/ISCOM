import pool from '../../config/database';
import { PoolClient } from 'pg';

export interface User {
    id: number;
    username: string;
    password_hash: string;
    role: string;
    created_at: Date;
}

export class UserRepository {
    async findByUsername(username: string): Promise<User | null> {
        const client = await pool.connect();
        try {
            const query = 'SELECT * FROM users WHERE username = $1';
            const result = await client.query(query, [username]);

            if (result.rows.length === 0) {
                return null;
            }

            return result.rows[0];
        } finally {
            client.release();
        }
    }

    // Include create for extensibility, though not strictly required by task but good practice
    async create(username: string, passwordHash: string, role: string = 'ADMIN'): Promise<User> {
        const client = await pool.connect();
        try {
            const query = `
                INSERT INTO users (username, password_hash, role)
                VALUES ($1, $2, $3)
                RETURNING *
            `;
            const result = await client.query(query, [username, passwordHash, role]);
            return result.rows[0];
        } finally {
            client.release();
        }
    }
}
