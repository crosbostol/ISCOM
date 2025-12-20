exports.shorthands = undefined;

exports.up = pgm => {
    // 1. Add 'assigned_movil_id' column to 'itm_ot'
    pgm.addColumns('itm_ot', {
        assigned_movil_id: {
            type: 'varchar(10)',
            references: '"movil"',
            onDelete: 'SET NULL',
            default: null,
            notNull: false
        }
    });

    // 2. Smart Backfill Logic
    pgm.sql(`
        UPDATE itm_ot io
        SET assigned_movil_id = CASE
            WHEN i.item_type IN ('OBRAS') THEN 
                 COALESCE(ot.civil_movil_id, ot.hydraulic_movil_id)
            WHEN i.item_type IN ('SHARED_ITEMS') THEN 
                 COALESCE(ot.debris_movil_id, ot.hydraulic_movil_id)
            ELSE COALESCE(ot.hydraulic_movil_id, ot.civil_movil_id)
        END
        FROM ot, item i
        WHERE io.ot_id = ot.id AND io.item_id = i.item_id;
    `);
};

exports.down = pgm => {
    pgm.dropColumns('itm_ot', ['assigned_movil_id']);
};
