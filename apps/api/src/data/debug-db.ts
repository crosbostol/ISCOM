
import pool from '../config/database';

const run = async () => {
    try {
        const client = await pool.connect();
        const res = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log('Tables:', res.rows.map(r => r.table_name));
        client.release();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
};

run();
