
import bcrypt from 'bcryptjs';
import pool from '../config/database';

const seed = async () => {
    try {
        console.log('Seeding database...');

        const client = await pool.connect();
        try {
            console.log('Ensuring admin user exists...');

            const initPassword = process.env.ADMIN_INIT_PASSWORD;
            // Fallback to admin2026 as per recent user request, or standard default
            const passwordToHash = initPassword || 'admin2026';

            console.log(`Setting admin password... (Target: ${passwordToHash.replace(/./g, '*')})`);

            const passwordHash = await bcrypt.hash(passwordToHash, 10);

            // Upsert Logic: Conflict on 'username' -> Update password
            const query = `
                INSERT INTO users (username, password_hash, role) 
                VALUES ($1, $2, $3)
                ON CONFLICT (username) 
                DO UPDATE SET password_hash = $2, role = $3
                RETURNING id, username;
            `;

            const result = await client.query(query, ['admin', passwordHash, 'ADMIN']);

            console.log(`[SEED] Admin user handled successfully. ID: ${result.rows[0].id}`);

        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
};

seed();
