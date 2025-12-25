/**
 * Migration: Create personnel table and payroll module tables
 * 
 * This migration creates:
 * 1. personnel table - Master table for all employees (conductors, assistants, staff)
 * 2. payroll_account - Employee payroll accounts
 * 3. payroll_transaction - Payment transactions (debits and credits)
 * 4. banking_info - Bank account information for transfers
 * 
 * DESIGN DECISION - Single Person per RUT:
 * ==========================================
 * The personnel table uses a UNIQUE constraint on RUT (Chilean national ID).
 * This enforces that each person appears exactly ONCE in the system, regardless of role.
 * 
 * Rationale:
 * - A person has one RUT for life (unique national identifier)
 * - Banking information is tied to a person's RUT, not their role
 * - Payroll accounts are per-person, not per-role
 * - Simplifies salary payments and tax reporting
 * 
 * Current Limitation - Single Role per Person:
 * =============================================
 * The current schema stores a single 'role' field per person.
 * If someone works in multiple capacities (e.g., both Conductor and Peoneta),
 * you must choose their PRIMARY role.
 * 
 * Future Enhancement (if needed):
 * ===============================
 * If multi-role support is required, consider:
 * 1. Create a separate 'personnel_roles' junction table:
 *    personnel_roles (personnel_id, role, is_primary, created_at)
 * 2. Keep personnel.role as the primary/default role
 * 3. Store additional roles in the junction table
 * 
 * This would allow tracking multiple roles while maintaining:
 * - One person = One RUT = One payroll account = One banking info
 */

/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    // ============================================================
    // 1. CREATE PERSONNEL TABLE
    // ============================================================
    pgm.createTable('personnel', {
        id: {
            type: 'serial',
            primaryKey: true
        },
        name: {
            type: 'varchar(100)',
            notNull: true
        },
        rut: {
            type: 'varchar(15)',
            notNull: true,
            unique: true,
            comment: 'Chilean national ID - unique per person, enforces one record per individual'
        },
        role: {
            type: 'varchar(50)',
            notNull: true,
            comment: 'Primary role: Conductor, Peoneta, Ayudante, etc. (single role per person in current design)'
        },
        conductor_id: {
            type: 'integer',
            references: 'conductor',
            onDelete: 'SET NULL',
            comment: 'Optional link to conductor table for operational staff'
        },
        is_active: {
            type: 'boolean',
            notNull: true,
            default: true
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('now()')
        }
    }, {
        ifNotExists: true
    });

    pgm.createIndex('personnel', 'rut', { ifNotExists: true });
    pgm.createIndex('personnel', 'conductor_id', { ifNotExists: true });

    // Populate personnel from existing conductors
    // NOTE: NOT EXISTS prevents duplicate RUT violations and makes this migration re-runnable
    // If a conductor's RUT already exists in personnel (e.g., from manual entry), skip them
    pgm.sql(`
        INSERT INTO personnel (name, rut, role, conductor_id, is_active, created_at)
        SELECT 
            c.name,
            c.rut,
            'Conductor' as role,
            c.id as conductor_id,
            true as is_active,
            c.created_at
        FROM conductor c
        WHERE NOT EXISTS (
            SELECT 1 FROM personnel p WHERE p.rut = c.rut
        )
    `);

    // ============================================================
    // 2. CREATE PAYROLL_ACCOUNT TABLE
    // ============================================================
    pgm.createTable('payroll_account', {
        id: {
            type: 'serial',
            primaryKey: true
        },
        personnel_id: {
            type: 'integer',
            notNull: true,
            unique: true,
            references: 'personnel',
            onDelete: 'CASCADE'
        },
        base_salary: {
            type: 'integer',
            notNull: true,
            comment: 'Base monthly salary in CLP'
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('now()')
        },
        updated_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('now()')
        }
    }, {
        ifNotExists: true
    });

    pgm.createIndex('payroll_account', 'personnel_id', { ifNotExists: true });

    // ============================================================
    // 3. CREATE PAYROLL_TRANSACTION TABLE
    // ============================================================
    pgm.createTable('payroll_transaction', {
        id: {
            type: 'serial',
            primaryKey: true
        },
        payroll_account_id: {
            type: 'integer',
            notNull: true,
            references: 'payroll_account',
            onDelete: 'CASCADE'
        },
        transaction_date: {
            type: 'date',
            notNull: true
        },
        transaction_type: {
            type: 'varchar(20)',
            notNull: true,
            check: "transaction_type IN ('ADVANCE', 'ABSENCE', 'BONUS', 'SALARY', 'LOAN')"
        },
        amount: {
            type: 'integer',
            notNull: true,
            comment: 'Signed integer: positive for credits, negative for debits'
        },
        description: {
            type: 'varchar(500)'
        },
        created_by_user_id: {
            type: 'integer',
            references: 'users',
            onDelete: 'SET NULL'
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('now()')
        }
    }, {
        ifNotExists: true
    });

    pgm.createIndex('payroll_transaction', 'payroll_account_id', {
        name: 'idx_payroll_transaction_account',
        ifNotExists: true
    });
    pgm.createIndex('payroll_transaction', 'transaction_date', {
        name: 'idx_payroll_transaction_date',
        ifNotExists: true
    });

    // ============================================================
    // 4. CREATE BANKING_INFO TABLE
    // ============================================================
    pgm.createTable('banking_info', {
        id: {
            type: 'serial',
            primaryKey: true
        },
        personnel_id: {
            type: 'integer',
            notNull: true,
            unique: true,
            references: 'personnel',
            onDelete: 'CASCADE'
        },
        bank_name: {
            type: 'varchar(50)',
            notNull: true,
            comment: 'Bank name according to SBIF'
        },
        account_type: {
            type: 'varchar(20)',
            notNull: true,
            check: "account_type IN ('CUENTA_CORRIENTE', 'CUENTA_VISTA', 'CUENTA_RUT')"
        },
        account_number: {
            type: 'varchar(20)',
            notNull: true,
            comment: 'Account number without hyphens or spaces'
        },
        rut: {
            type: 'varchar(15)',
            notNull: true,
            comment: 'Account holder RUT (should match personnel.rut)'
        },
        email: {
            type: 'varchar(100)'
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('now()')
        },
        updated_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('now()')
        }
    }, {
        ifNotExists: true
    });

    pgm.createIndex('banking_info', 'personnel_id', {
        name: 'idx_banking_info_personnel',
        ifNotExists: true
    });

    // Add CHECK constraint to ensure banking_info.rut matches personnel.rut
    // This prevents the two RUT values from becoming out of sync
    pgm.addConstraint('banking_info', 'banking_info_rut_matches_personnel', {
        check: `rut = (SELECT p.rut FROM personnel p WHERE p.id = personnel_id)`
    });
};

exports.down = (pgm) => {
    // Drop the CHECK constraint first
    pgm.dropConstraint('banking_info', 'banking_info_rut_matches_personnel', { ifExists: true });

    // Drop tables in reverse order
    pgm.dropTable('banking_info', { ifExists: true, cascade: true });
    pgm.dropTable('payroll_transaction', { ifExists: true, cascade: true });
    pgm.dropTable('payroll_account', { ifExists: true, cascade: true });
    pgm.dropTable('personnel', { ifExists: true, cascade: true });
};
