
import pool from '../config/database';

async function verifyData() {
    try {
        console.log('--- Debugging Data ---');
        const res = await pool.query(`
            SELECT id, external_ot_id, ot_state, finished_at, dismissed, started_at 
            FROM ot 
            WHERE ot_state LIKE '%PAGAR%'
            LIMIT 10
        `);
        console.log(JSON.stringify(res.rows, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

verifyData();
