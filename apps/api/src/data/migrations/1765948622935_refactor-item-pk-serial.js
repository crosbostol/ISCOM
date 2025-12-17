exports.shorthands = undefined;

exports.up = (pgm) => {
    // 1. Drop the FK constraint from itm_ot (referencing item.item_id)
    // We assume the standard naming convention 'itm_ot_item_id_fkey'.
    pgm.dropConstraint('itm_ot', 'itm_ot_item_id_fkey', { ifExists: true });

    // 2. Alter columns to INTEGER
    // We must use 'USING item_id::integer' to convert existing string numbers ('500') to int (500).
    pgm.alterColumn('item', 'item_id', {
        type: 'integer',
        notNull: true,
        using: 'item_id::integer'
    });

    pgm.alterColumn('itm_ot', 'item_id', {
        type: 'integer',
        notNull: true,
        using: 'item_id::integer'
    });

    // 3. Create Sequence and attach it (SERIAL behavior)
    pgm.createSequence('item_item_id_seq', {
        type: 'integer',
        increment: 1
    });

    // Set default value for item_id
    pgm.alterColumn('item', 'item_id', {
        default: pgm.func("nextval('item_item_id_seq')")
    });

    // Link sequence to column (so it drops with the table)
    pgm.sql("ALTER SEQUENCE item_item_id_seq OWNED BY item.item_id");

    // 4. CRITICAL: Sync sequence with existing Max ID
    // Uses COALESCE to handle empty table case safely.
    pgm.sql("SELECT setval('item_item_id_seq', COALESCE((SELECT MAX(item_id) FROM item), 0) + 1, false)");

    // 5. Restore FK Constraint
    pgm.addConstraint('itm_ot', 'itm_ot_item_id_fkey', {
        foreignKeys: {
            columns: 'item_id',
            references: 'item(item_id)',
            onUpdate: 'CASCADE',
            onDelete: 'NO ACTION'
        }
    });
};

exports.down = (pgm) => {
    // Reverse operations
    pgm.dropConstraint('itm_ot', 'itm_ot_item_id_fkey');

    // Convert back to VARCHAR
    pgm.alterColumn('itm_ot', 'item_id', {
        type: 'varchar(20)',
        using: 'item_id::varchar'
    });

    pgm.alterColumn('item', 'item_id', {
        type: 'varchar(20)',
        default: null, // remove sequence default
        using: 'item_id::varchar'
    });

    pgm.dropSequence('item_item_id_seq');

    // Restore FK
    pgm.addConstraint('itm_ot', 'itm_ot_item_id_fkey', {
        foreignKeys: {
            columns: 'item_id',
            references: 'item(item_id)',
            onUpdate: 'CASCADE',
            onDelete: 'NO ACTION'
        }
    });
};
