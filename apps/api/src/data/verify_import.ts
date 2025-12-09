
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
        await client.query("DELETE FROM itm_ot WHERE ot_id IN (SELECT id FROM ot WHERE street LIKE 'TEST STREET%')");
        await client.query("DELETE FROM ot WHERE external_ot_id LIKE 'TEST-OT%'");
        // Also clean up matches for heuristic search test
        // Heuristic: StartedAt = '2025-01-01', HydraulicMovil = 'TEST-MOV' (if we create one) or reuse existing.
        // We will strictly test External ID flow first for simplicity, then Heuristic.
        await client.query("DELETE FROM ot WHERE street LIKE 'TEST STREET%'");
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

    // Heuristic Row 1 (Empty OT)
    content += `;M-100;02-01-2025;TEST STREET 3;125;TEST COMMUNE;TEST REPAIR 1;1,0;SI\n`;
    // Heuristic Row 2 (Empty OT, Same Address, Different Item, Maybe different/null Movil if we want to test robustness)
    // We send SAME Address/Date. Should merge.
    content += `;M-100;02-01-2025;TEST STREET 3;125;TEST COMMUNE;TEST REPAIR 2;1,0;SI\n`;

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
        await client.query("INSERT INTO item (item_id, description, item_value, item_type, item_unit) VALUES ('TEST-ITM-1', 'TEST REPAIR 1', 100, 'TEST', 'UN') ON CONFLICT (description) DO NOTHING");
        await client.query("INSERT INTO item (item_id, description, item_value, item_type, item_unit) VALUES ('TEST-ITM-2', 'TEST REPAIR 2', 100, 'TEST', 'UN') ON CONFLICT (description) DO NOTHING");
        await client.query("INSERT INTO item (item_id, description, item_value, item_type, item_unit) VALUES ('TEST-ITM-MATCH', 'TEST REPAIR MATCH', 100, 'TEST', 'UN') ON CONFLICT (description) DO NOTHING");
        // Insert Test Inventory
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
    console.log('OT Count after Run 1:', count1);
    // Expectation:
    // 1. External OT (TEST-OT-001)
    // 2. Heuristic OT (TEST STREET 3) -> Merged 2 rows into 1 OT.
    // Total should be 2.
    if (parseInt(count1) !== 2) throw new Error(`Expected 2 OTs, got ${count1}`);

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

    // Run 4: Import Heuristic Match against Empty String ExternalID
    console.log('\n--- Run 4: Empty String External ID Match ---');
    // Manually insert an OT with empty string external_id matching the heuristic
    const clientForRun4 = await pool.connect();
    try {
        await clientForRun4.query(`
            INSERT INTO ot (street, number_street, commune, started_at, external_ot_id, is_additional, hydraulic_movil_id) 
            VALUES ('TEST STREET 4', '999', 'TEST COMMUNE', '2025-01-02', NULL, true, '9999')
        `);
    } finally {
        clientForRun4.release();
    }

    // Create CSV row that matches above: TEST STREET 4, 999, Date 02-01-2025, No OT Code
    let content4 = `OT;MÓVIL;FECHA EJECUCION;DIRECCIÓN;NUMERAL;COMUNA;REPARACIÓN;CANTIDAD;ADICIONAL\n`;
    content4 += `;M-100;02-01-2025;TEST STREET 4;999;TEST COMMUNE;TEST REPAIR MATCH;1,0;SI\n`;
    fs.writeFileSync(csvPath, content4);

    const res4 = await importService.processCsv(csvPath);
    console.log('Result 4:', res4);

    const count4 = (await pool.query("SELECT COUNT(*) FROM ot WHERE street = 'TEST STREET 4'")).rows[0].count;
    console.log('OT Count for Run 4 (Should be 1):', count4);

    if (parseInt(count4) !== 1) {
        throw new Error('Run 4 Failed: Duplicate created instead of merging with empty string external_id.');
    }

    // Run 5: Aggregation Test (Data Loss Fix)
    console.log('\n--- Run 5: Aggregation Test ---');
    // Create CSV with 2 rows for the same OT and same Item, different quantities
    // OT: TEST-OT-AGG-1, Item: TEST-ITM-AGG, Qty 1: 5.5, Qty 2: 4.5 -> Total 10.0

    // Setup Item first
    const clientForRun5 = await pool.connect();
    try {
        await clientForRun5.query("INSERT INTO item (item_id, description, item_value, item_type, item_unit) VALUES ('TEST-ITM-AGG', 'TEST AGGREGATION', 100, 'TEST', 'UN') ON CONFLICT (description) DO NOTHING");
    } finally {
        clientForRun5.release();
    }

    let content5 = `OT;MÓVIL;FECHA EJECUCION;DIRECCIÓN;NUMERAL;COMUNA;REPARACIÓN;CANTIDAD;ADICIONAL\n`;
    content5 += `TEST-OT-AGG-1;M-100;05-01-2025;TEST STREET AGG;100;TEST COMMUNE;TEST AGGREGATION;5,5;NO\n`;
    content5 += `TEST-OT-AGG-1;M-100;05-01-2025;TEST STREET AGG;100;TEST COMMUNE;TEST AGGREGATION;4,5;NO\n`;
    fs.writeFileSync(csvPath, content5);

    const res5 = await importService.processCsv(csvPath);
    console.log('Result 5:', res5);

    const aggCheck = await pool.query(`
        SELECT io.quantity 
        FROM itm_ot io
        JOIN ot o ON io.ot_id = o.id
        WHERE o.external_ot_id = 'TEST-OT-AGG-1'
    `);

    if (aggCheck.rows.length !== 1) {
        throw new Error(`Expected 1 item row for Aggregation Test, got ${aggCheck.rows.length}`);
    }

    const totalQty = parseFloat(aggCheck.rows[0].quantity);
    console.log('Aggregation Total Qty:', totalQty);

    if (totalQty !== 10) {
        throw new Error(`Expected total quantity 10, got ${totalQty}`);
    }

    console.log('\n--- Verification SUCCESS ---');
    await cleanUp();
    process.exit(0);
};

run().catch(err => {
    console.error(err);
    process.exit(1);
});
