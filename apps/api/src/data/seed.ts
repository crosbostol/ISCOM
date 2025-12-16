
import bcrypt from 'bcryptjs';
import pool from '../config/database';

const seed = async () => {
    try {
        console.log('Seeding database...');

        const client = await pool.connect();
        try {
            // Check if admin user exists
            const checkUser = await client.query('SELECT * FROM users WHERE username = $1', ['admin']);

            if (checkUser.rows.length === 0) {
                console.log('Creating admin user...');

                const initPassword = process.env.ADMIN_INIT_PASSWORD;
                if (!initPassword) {
                    console.warn('[WARN] ADMIN_INIT_PASSWORD not set. Using insecure fallback.');
                }
                const passwordToHash = initPassword || 'admin2025';

                const passwordHash = await bcrypt.hash(passwordToHash, 10);

                await client.query(
                    'INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)',
                    ['admin', passwordHash, 'ADMIN']
                );
                console.log('[SEED] Admin user created successfully.');
            } else {
                console.log('[SEED] Admin user already exists. Skipping creation.');
                process.exit(0);
            }
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
