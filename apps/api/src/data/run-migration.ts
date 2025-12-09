
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const run = async () => {
    const dbUrl = `postgres://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

    console.log(`Running migrations...`);

    try {
        // Use eval to prevent TypeScript from transpiling dynamic import to require()
        const pgMigrate = await (eval('import("node-pg-migrate")') as Promise<any>);

        // Handle different export structures (default export vs named export)
        const runner = pgMigrate.runner || (pgMigrate.default && pgMigrate.default.default) || pgMigrate.default;

        if (typeof runner !== 'function') {
            console.error('DEBUG: Loaded node-pg-migrate keys:', Object.keys(pgMigrate));
            throw new Error('Runner is not a function');
        }

        await runner({
            databaseUrl: dbUrl,
            // Point to src/data/migrations relative to dist/data (apps/api/dist/data)
            // ../../src points to apps/api/src
            dir: path.join(__dirname, '../../src/data/migrations'),
            direction: 'up',
            migrationsTable: 'pgmigrations',
            count: Infinity, // Run all pending
        });
        console.log('Migrations completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

run();
