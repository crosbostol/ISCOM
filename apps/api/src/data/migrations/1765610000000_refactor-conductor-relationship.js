/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    // --- PASO A: Sanear movil (Defensivo) ---
    // 1. Desvincular conductores existentes para evitar violaciones de FK
    // (Si la columna existe, esto pondrá nulls. Si no existe, fallará, así que mejor chequeamos existencia o asumimos drop)
    // El método sql es directo, pero si la tabla está rota... 
    // Mejor usar operaciones de esquema que son más seguras con ifExists.

    // Primero intentamos borrar el constraint si existe
    pgm.dropConstraint('movil', 'fk_movil_conductor', { ifExists: true });

    // Borramos la columna antigua. Esto elimina los datos de asociación, pero es lo requerido ("Purge").
    pgm.dropColumn('movil', 'conductor_id', { ifExists: true });


    // --- PASO B: Renacer conductor (The Purge) ---
    // Borramos la tabla conductor completa. CASCADE eliminará cualquier otra referencia residual.
    pgm.dropTable('conductor', { ifExists: true, cascade: true });


    // --- PASO C: Crear Nueva Estructura ---
    // Creamos la tabla conductor limpia con id serial estándar
    pgm.createTable('conductor', {
        id: { type: 'serial', primaryKey: true },
        name: { type: 'varchar(100)', notNull: true },
        rut: { type: 'varchar(15)', notNull: true, unique: true },
        created_at: { type: 'timestamp', default: pgm.func('NOW()') }
    });


    // --- PASO D: Reconectar movil ---
    // Agregamos la columna conductor_id a movil como Integer
    pgm.addColumns('movil', {
        conductor_id: { type: 'integer', notNull: false }
    });

    // Agregamos el constraint FK
    pgm.addConstraint('movil', 'fk_movil_conductor', {
        foreignKeys: {
            columns: 'conductor_id',
            references: 'conductor(id)',
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
        }
    });

    // Índices recomendados por defecto para FKs
    pgm.createIndex('movil', 'conductor_id', { ifNotExists: true });
};

exports.down = pgm => {
    // Reverse logic (Best Effort)

    // 1. Drop FK from movil
    pgm.dropConstraint('movil', 'fk_movil_conductor', { ifExists: true });

    // 2. Drop column conductor_id from movil
    pgm.dropColumn('movil', 'conductor_id', { ifExists: true });

    // 3. Drop table conductor
    pgm.dropTable('conductor', { ifExists: true });

    // 4. Restore "Old World" (Optional, but good for completeness if we wanted to truly rollback)
    // Creating the old varchar table
    pgm.createTable('conductor', {
        conductor_id: { type: 'varchar(30)', primaryKey: true },
        movil_id: { type: 'varchar(10)', notNull: false },
        name: { type: 'varchar(100)', notNull: true },
        rut: { type: 'varchar(15)' }
    });

    // Restore old column in movil
    pgm.addColumns('movil', {
        conductor_id: { type: 'varchar(50)', notNull: false } // was nullable/varchar
    });

    // We can't easily restore the circular FK circular dependency correctly without circular logic, 
    // but we can restore the column structure.
};
