
import dotenv from 'dotenv';
import path from 'path';
import * as fs from 'fs';
import pool from '../config/database';
import { ImportService } from '../services/ImportService';
import { OtRepository } from '../data/repositories/OtRepository';
import { MovilRepository } from '../data/repositories/MovilRepository';
import { ItemRepository } from '../data/repositories/ItemRepository';
import { ItmOtRepository } from '../data/repositories/ItmOtRepository';

dotenv.config();

const cleanUp = async () => {
    // Delete test OTs and ItmOts
    const client = await pool.connect();
    try {
        await client.query("DELETE FROM itm_ot WHERE ot_id IN (SELECT id FROM ot WHERE external_ot_id LIKE 'TEST-OT%')");
        await client.query("DELETE FROM ot WHERE external_ot_id LIKE 'TEST-OT%'");
        // Also clean up matches for heuristic search test
        // Heuristic: StartedAt = '2025-01-01', HydraulicMovil = 'TEST-MOV' (if we create one) or reuse existing.
        // We will strictly test External ID flow first for simplicity, then Heuristic.
        await client.query("DELETE FROM ot WHERE street = 'TEST STREET' AND commune = 'TEST COMMUNE'");
    } finally {
        client.release();
    }
};

const createTestCsv = (filePath: string, run: number) => {
    // Run 1: 2 rows (1 External, 1 Additional/Heuristic)
    // Run 2: Same rows (Should be ignored/updated) ~ Actually Insert logic is "Find or Create", so effectively ignored if found.
    // Run 3: Add 1 row.

    let content = `OT;MÓVIL;FECHA EJECUCION;DIRECCIÓN;NUMERAL;COMUNA;REPARACIÓN;CANTIDAD;ADICIONAL\n`;

    // Row 1: External ID
    content += `TEST-OT-001;M-100;01-01-2025;TEST STREET;123;TEST COMMUNE;TEST REPAIR;1,5;NO\n`;

    // Row 2: Heuristic (Empty OT)
    // We need a Movil that likely exists or we mock it?
    // If Movil 'M-100' doesn't exist, hydraulic_movil_id will be null.
    // Our code: if (movil) hydraulicMovilId = movil.movil_id.
    // We should insert a dummy Movil first? Or use one if it exists.
    // Let's assume M-100 doesn't exist so it's null.
    // Then Heuristic: (StartedAt, Movil=NULL) ?
    // Query: hydraulic_movil_id = $2. If $2 is null, 'AND hydraulic_movil_id = NULL' in SQL doesn't work (needs IS NULL).
    // Postgres driver might handle it? No, usually `field = NULL` is always false.
    // My code: `AND hydraulic_movil_id = $2`.
    // If $2 is null, the query fails to find anything.
    // So for heuristic to work, we verify date and null movil?
    // Wait, typical use case involves a valid Movil.
    // I will insert a dummy Item and Movil for the test.

    if (run === 3) {
        content += `TEST-OT-002;M-100;01-01-2025;TEST STREET 2;124;TEST COMMUNE;TEST REPAIR;2,0;NO\n`;
    }

    // Heuristic Row (Empty OT)
    content += `;M-100;02-01-2025;TEST STREET 3;125;TEST COMMUNE;TEST REPAIR;1,0;SI\n`;

    fs.writeFileSync(filePath, content);
};

const run = async () => {
    console.log('--- Starting Verification ---');
    const importService = new ImportService(
        new OtRepository(),
        new MovilRepository(),
        new ItemRepository(),
        new ItmOtRepository()
    );

    // 1. Setup Data
    const client = await pool.connect();
    try {
        await cleanUp();
        // Insert Test Item
        await client.query("INSERT INTO item (item_id, description, item_value, item_type, item_unit) VALUES ('TEST-ITM', 'TEST REPAIR', 100, 'TEST', 'UN') ON CONFLICT (description) DO NOTHING");
        // Insert Test Inventory
        await client.query("INSERT INTO inventory (inventory_id) VALUES ('INV-99') ON CONFLICT (inventory_id) DO NOTHING");

        // Insert Test Movil
        // Our code uses findByExternalCode.
        // Movil table: movil_id, external_code.
        // We'll try to insert 'M-100' -> movil_id '9999'.
        await client.query("INSERT INTO movil (movil_id, inventory_id, movil_type, external_code) VALUES ('9999', 'INV-99', 'CAMIONETA', 'M-100') ON CONFLICT (movil_id) DO NOTHING");
        // Since we used ON CONFLICT DO NOTHING, we make sure external_code matches if it existed
        await client.query("UPDATE movil SET external_code = 'M-100' WHERE movil_id = '9999'");
    } finally {
        client.release();
    }

    const csvPath = path.join(__dirname, 'test_import.csv');

    // Run 1: Initial Import
    console.log('\n--- Run 1: Initial Import ---');
    createTestCsv(csvPath, 1);
    const res1 = await importService.processCsv(csvPath);
    console.log('Result 1:', res1);

    const count1 = (await pool.query("SELECT COUNT(*) FROM ot WHERE street LIKE 'TEST STREET%'")).rows[0].count;
    console.log('OT Count after Run 1:', count1); // Should be 2 (1 explicit, 1 heuristic)

    // Run 2: Re-import Same File (Idempotency)
    console.log('\n--- Run 2: Re-import (Idempotency) ---');
    createTestCsv(csvPath, 1);
    const res2 = await importService.processCsv(csvPath);
    console.log('Result 2:', res2);

    const count2 = (await pool.query("SELECT COUNT(*) FROM ot WHERE street LIKE 'TEST STREET%'")).rows[0].count;
    console.log('OT Count after Run 2:', count2); // Should be 2

    if (count1 !== count2) {
        throw new Error('Idempotency Failed! Counts do not match.');
    }

    // Run 3: Import with New Row
    console.log('\n--- Run 3: Import New Row ---');
    createTestCsv(csvPath, 3);
    // Rows: OT-001, OT-002, Heuristic.
    // OT-001 exists. Heuristic exists. OT-002 is new.
    // Should add 1 OT.
    const res3 = await importService.processCsv(csvPath);
    console.log('Result 3:', res3);

    const count3 = (await pool.query("SELECT COUNT(*) FROM ot WHERE street LIKE 'TEST STREET%'")).rows[0].count;
    console.log('OT Count after Run 3:', count3); // Should be 3

    if (parseInt(count3) !== parseInt(count2) + 1) {
        throw new Error(`Expected count to increase by 1. Pre: ${count2}, Post: ${count3}`);
    }

    console.log('\n--- Verification SUCCESS ---');
    await cleanUp();
    process.exit(0);
};

run().catch(err => {
    console.error(err);
    process.exit(1);
});
