/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    // 1. Inventory
    pgm.createTable('inventory', {
        inventory_id: { type: 'varchar(20)', notNull: true, primaryKey: true },
        updated_at: { type: 'timestamp', default: pgm.func('current_timestamp') }
    });

    // 2. Product
    pgm.createTable('product', {
        product_id: { type: 'serial', notNull: true, primaryKey: true },
        product_name: { type: 'varchar(50)', notNull: true },
        product_category: { type: 'varchar(50)', notNull: true },
        product_unit: { type: 'varchar(50)', notNull: true }
    });

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
    });
    pgm.addConstraint('inv_pro', 'inv_pro_pkey', {
        primaryKey: ['product_id', 'inventory_id']
    });

    // 4. Update Trigger Function
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

    // 5. Pro_OT (Requires OT table to exist, assumed dependent on previous migrations)
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
    });

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
    });

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
    });
};

exports.down = pgm => {
    pgm.dropTable('image');
    pgm.dropTable('conductor');
    pgm.dropTrigger('pro_ot', 'update_inv_pro_trigger');
    pgm.dropTable('pro_ot');
    pgm.dropFunction('update_inv_pro', []);
    pgm.dropTable('inv_pro');
    pgm.dropTable('product');
    pgm.dropTable('inventory');
};
