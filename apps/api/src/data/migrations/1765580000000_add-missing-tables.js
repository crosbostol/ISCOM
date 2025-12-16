/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    // 1. Inventory
    pgm.createTable('inventory', {
        inventory_id: { type: 'varchar(20)', notNull: true, primaryKey: true },
        updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
    }, { ifNotExists: true });

    // 2. Product
    pgm.createTable('product', {
        product_id: { type: 'serial', notNull: true, primaryKey: true },
        product_name: { type: 'varchar(50)', notNull: true },
        product_category: { type: 'varchar(50)', notNull: true },
        product_unit: { type: 'varchar(50)', notNull: true }
    }, { ifNotExists: true });

    // 3. Inv_Pro
    pgm.createTable('inv_pro', {
        product_id: {
            type: 'integer',
            notNull: true,
            references: '"product"',
            onDelete: 'CASCADE'
        },
        inventory_id: {
            type: 'varchar',
            notNull: true,
            references: '"inventory"',
            onDelete: 'CASCADE'
        },
        quantity: { type: 'numeric', notNull: true, default: 0 }
    }, { ifNotExists: true });

    // Idempotent constraint: Check if exists before adding (using PL/pgSQL)
    pgm.sql(`
        DO $$
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'inv_pro_pkey') THEN
                ALTER TABLE public.inv_pro ADD CONSTRAINT inv_pro_pkey PRIMARY KEY (product_id, inventory_id);
            END IF;
        END $$;
    `);

    // 4. Update Trigger Function (replace: true handles idempotency)
    pgm.createFunction(
        'update_inv_pro',
        [],
        {
            returns: 'trigger',
            language: 'plpgsql',
            replace: true
        },
        `
    BEGIN
      UPDATE public.inv_pro
      SET quantity = quantity - NEW.quantity
      WHERE product_id = NEW.product_id
        AND inventory_id = NEW.inventory_id;
      RETURN NEW;
    END;
    `
    );

    // 5. Pro_OT
    pgm.createTable('pro_ot', {
        product_id: {
            type: 'integer',
            notNull: true,
            references: '"product"',
            onDelete: 'CASCADE'
        },
        quantity: { type: 'numeric' },
        inventory_id: {
            type: 'varchar(20)',
            notNull: true,
            references: '"inventory"',
            onDelete: 'CASCADE'
        },
        ot_id: {
            type: 'integer',
            notNull: true,
            references: '"ot"',
            onDelete: 'CASCADE'
        }
    }, { ifNotExists: true });

    // Trigger: Drop if exists then create
    pgm.sql('DROP TRIGGER IF EXISTS update_inv_pro_trigger ON public.pro_ot;');
    pgm.createTrigger('pro_ot', 'update_inv_pro_trigger', {
        when: 'AFTER',
        operation: 'INSERT',
        function: 'update_inv_pro',
        level: 'ROW'
    });

    // 6. Conductor
    pgm.createTable('conductor', {
        conductor_id: { type: 'varchar(30)', notNull: true, primaryKey: true },
        movil_id: {
            type: 'varchar(10)',
            notNull: true,
            references: '"movil"',
            onUpdate: 'CASCADE'
        },
        name: { type: 'varchar(100)', notNull: true },
        rut: { type: 'varchar(15)' }
    }, { ifNotExists: true });

    // 7. Image
    pgm.createTable('image', {
        image_id: { type: 'serial', notNull: true, primaryKey: true },
        url: { type: 'varchar', notNull: true },
        ot_id: {
            type: 'integer',
            notNull: true,
            references: '"ot"',
            onDelete: 'CASCADE'
        }
    }, { ifNotExists: true });
};

exports.down = pgm => {
    pgm.dropTable('image', { ifExists: true });
    pgm.dropTable('conductor', { ifExists: true });
    pgm.dropTrigger('pro_ot', 'update_inv_pro_trigger', { ifExists: true });
    pgm.dropTable('pro_ot', { ifExists: true });
    pgm.dropFunction('update_inv_pro', [], { ifExists: true });
    pgm.dropTable('inv_pro', { ifExists: true });
    pgm.dropTable('product', { ifExists: true });
    pgm.dropTable('inventory', { ifExists: true });
};
