/**
 * Migration: Create audit_log table for tracking sensitive operations
 * 
 * This migration creates the audit_log table to track:
 * - Payroll exports
 * - Banking info modifications
 * - Large transactions
 * - Other sensitive financial operations
 */

/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
    pgm.createTable('audit_log', {
        id: {
            type: 'serial',
            primaryKey: true
        },
        user_id: {
            type: 'integer',
            references: 'users',
            onDelete: 'SET NULL',
            comment: 'User who performed the action'
        },
        action_type: {
            type: 'varchar(50)',
            notNull: true,
            comment: 'Type of action: PAYROLL_EXPORT, BANKING_INFO_CREATED, etc.'
        },
        action_description: {
            type: 'text',
            comment: 'Human-readable description of the action'
        },
        metadata: {
            type: 'jsonb',
            comment: 'Additional structured data (e.g., record count, total amount, affected personnel IDs)'
        },
        ip_address: {
            type: 'varchar(45)',
            comment: 'IP address of the user (supports IPv6)'
        },
        user_agent: {
            type: 'text',
            comment: 'User agent string from the request'
        },
        created_at: {
            type: 'timestamp',
            notNull: true,
            default: pgm.func('now()')
        }
    }, {
        ifNotExists: true
    });

    // Create indexes for common queries
    pgm.createIndex('audit_log', 'user_id', {
        name: 'idx_audit_log_user',
        ifNotExists: true
    });

    pgm.createIndex('audit_log', 'action_type', {
        name: 'idx_audit_log_action_type',
        ifNotExists: true
    });

    pgm.createIndex('audit_log', 'created_at', {
        name: 'idx_audit_log_created_at',
        ifNotExists: true
    });

    // Create index on metadata for JSONB queries
    pgm.createIndex('audit_log', 'metadata', {
        name: 'idx_audit_log_metadata',
        method: 'gin',
        ifNotExists: true
    });
};

exports.down = (pgm) => {
    pgm.dropTable('audit_log', { ifExists: true, cascade: true });
};
