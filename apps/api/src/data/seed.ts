
import bcrypt from 'bcryptjs';
import pool from '../config/database';

const seed = async () => {
    try {
        console.log('🌱 Seeding database...');

        const client = await pool.connect();
        try {
            // Get passwords from environment or use defaults
            const adminPassword = process.env.ADMIN_INIT_PASSWORD || 'admin2026';
            const managerPassword = process.env.MANAGER_INIT_PASSWORD || 'manager2026';

            console.log('🔐 Hashing passwords...');
            const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
            const managerPasswordHash = await bcrypt.hash(managerPassword, 10);

            // Upsert query (idempotent)
            const upsertQuery = `
                INSERT INTO users (username, password_hash, role) 
                VALUES ($1, $2, $3)
                ON CONFLICT (username) 
                DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role
                RETURNING id, username, role;
            `;

            // 1. Ensure ADMIN user exists
            console.log('👤 Creating/Updating ADMIN user...');
            const adminResult = await client.query(upsertQuery, ['admin', adminPasswordHash, 'ADMIN']);
            console.log(`   ✅ ADMIN user: ID=${adminResult.rows[0].id}, username=${adminResult.rows[0].username}, role=${adminResult.rows[0].role}`);

            // 2. Ensure MANAGER user exists
            console.log('👤 Creating/Updating MANAGER user...');
            const managerResult = await client.query(upsertQuery, ['manager', managerPasswordHash, 'MANAGER']);
            console.log(`   ✅ MANAGER user: ID=${managerResult.rows[0].id}, username=${managerResult.rows[0].username}, role=${managerResult.rows[0].role}`);

            console.log('\n🎉 Database seeding completed successfully!');
            console.log('\n📝 Login credentials:');
            console.log('   ADMIN:   username=admin,   password=' + (process.env.ADMIN_INIT_PASSWORD ? '[from env]' : 'admin2026'));
            console.log('   MANAGER: username=manager, password=' + (process.env.MANAGER_INIT_PASSWORD ? '[from env]' : 'manager2026'));

        } finally {
            client.release();
        }

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
};

seed();
