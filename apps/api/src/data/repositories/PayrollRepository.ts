import pool from '../../config/database';
import { PoolClient } from 'pg';

// ============================================================
// INTERFACES
// ============================================================

export interface Personnel {
    id: number;
    name: string;
    rut: string;
    role: string;
    conductor_id: number | null;
    is_active: boolean;
    created_at: Date;
}

export interface PayrollAccount {
    id: number;
    personnel_id: number;
    base_salary: number;
    created_at: Date;
    updated_at: Date;
}

export interface PayrollTransaction {
    id: number;
    payroll_account_id: number;
    transaction_date: Date;
    transaction_type: 'ADVANCE' | 'ABSENCE' | 'BONUS' | 'SALARY' | 'LOAN';
    amount: number;
    description: string | null;
    created_by_user_id: number | null;
    created_at: Date;
}

export interface BankingInfo {
    id: number;
    personnel_id: number;
    bank_name: string;
    account_type: 'CUENTA_CORRIENTE' | 'CUENTA_VISTA' | 'CUENTA_RUT';
    account_number: string;
    rut: string;
    email: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface PayrollAccountWithBalance extends PayrollAccount {
    employee_name: string;
    employee_rut: string;
    employee_role: string;
    current_balance: number;
}

export interface PayrollLedgerEntry extends PayrollTransaction {
    created_by_username: string | null;
}

export interface EmployeeForPayroll {
    personnel_id: number;
    name: string;
    rut: string;
    current_balance: number;
    bank_name: string;
    account_type: string;
    account_number: string;
    email: string | null;
}

// ============================================================
// DTOs
// ============================================================

export interface CreatePayrollAccountDTO {
    personnel_id: number;
    base_salary: number;
}

export interface CreateTransactionDTO {
    payroll_account_id: number;
    transaction_date: Date;
    transaction_type: 'ADVANCE' | 'ABSENCE' | 'BONUS' | 'SALARY' | 'LOAN';
    amount: number;
    description?: string;
    created_by_user_id?: number;
}

export interface CreateBankingInfoDTO {
    personnel_id: number;
    bank_name: string;
    account_type: 'CUENTA_CORRIENTE' | 'CUENTA_VISTA' | 'CUENTA_RUT';
    account_number: string;
    rut: string;
    email?: string;
}

export interface UpdateBankingInfoDTO {
    bank_name?: string;
    account_type?: 'CUENTA_CORRIENTE' | 'CUENTA_VISTA' | 'CUENTA_RUT';
    account_number?: string;
    rut?: string;
    email?: string;
}

// ============================================================
// REPOSITORY CLASS
// ============================================================

export class PayrollRepository {

    // ========== PAYROLL ACCOUNT METHODS ==========

    async findAllAccountsWithBalance(): Promise<PayrollAccountWithBalance[]> {
        const client = await pool.connect();
        try {
            const query = `
                SELECT 
                    pa.id,
                    pa.personnel_id,
                    pa.base_salary,
                    pa.created_at,
                    pa.updated_at,
                    p.name AS employee_name,
                    p.rut AS employee_rut,
                    p.role AS employee_role,
                    COALESCE(SUM(pt.amount), 0) AS current_balance
                FROM payroll_account pa
                JOIN personnel p ON pa.personnel_id = p.id
                LEFT JOIN payroll_transaction pt ON pt.payroll_account_id = pa.id
                WHERE p.is_active = true
                GROUP BY pa.id, pa.personnel_id, pa.base_salary, pa.created_at, pa.updated_at,
                         p.name, p.rut, p.role
                ORDER BY p.name
            `;
            const result = await client.query(query);
            return result.rows;
        } finally {
            client.release();
        }
    }

    async findAccountByEmployeeId(personnelId: number): Promise<PayrollAccount | null> {
        const client = await pool.connect();
        try {
            const query = 'SELECT * FROM payroll_account WHERE personnel_id = $1';
            const result = await client.query(query, [personnelId]);
            return result.rows.length > 0 ? result.rows[0] : null;
        } finally {
            client.release();
        }
    }

    async createAccount(data: CreatePayrollAccountDTO): Promise<PayrollAccount> {
        const client = await pool.connect();
        try {
            const query = `
                INSERT INTO payroll_account (personnel_id, base_salary)
                VALUES ($1, $2)
                RETURNING *
            `;
            const result = await client.query(query, [data.personnel_id, data.base_salary]);
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    // ========== TRANSACTION METHODS ==========

    async findTransactionsByAccountId(accountId: number): Promise<PayrollLedgerEntry[]> {
        const client = await pool.connect();
        try {
            const query = `
                SELECT 
                    pt.*,
                    u.username AS created_by_username
                FROM payroll_transaction pt
                LEFT JOIN users u ON pt.created_by_user_id = u.id
                WHERE pt.payroll_account_id = $1
                ORDER BY pt.transaction_date DESC, pt.id DESC
            `;
            const result = await client.query(query, [accountId]);
            return result.rows;
        } finally {
            client.release();
        }
    }

    async createTransaction(data: CreateTransactionDTO): Promise<PayrollTransaction> {
        const client = await pool.connect();
        try {
            const query = `
                INSERT INTO payroll_transaction 
                (payroll_account_id, transaction_date, transaction_type, amount, description, created_by_user_id)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;
            const result = await client.query(query, [
                data.payroll_account_id,
                data.transaction_date,
                data.transaction_type,
                data.amount,
                data.description || null,
                data.created_by_user_id || null
            ]);
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    async calculateBalance(accountId: number): Promise<number> {
        const client = await pool.connect();
        try {
            const query = `
                SELECT COALESCE(SUM(amount), 0) AS balance
                FROM payroll_transaction
                WHERE payroll_account_id = $1
            `;
            const result = await client.query(query, [accountId]);
            return parseInt(result.rows[0].balance);
        } finally {
            client.release();
        }
    }

    // ========== BANKING INFO METHODS ==========

    async findBankingInfoByEmployeeId(personnelId: number): Promise<BankingInfo | null> {
        const client = await pool.connect();
        try {
            const query = 'SELECT * FROM banking_info WHERE personnel_id = $1';
            const result = await client.query(query, [personnelId]);
            return result.rows.length > 0 ? result.rows[0] : null;
        } finally {
            client.release();
        }
    }

    async createBankingInfo(data: CreateBankingInfoDTO): Promise<BankingInfo> {
        const client = await pool.connect();
        try {
            const query = `
                INSERT INTO banking_info 
                (personnel_id, bank_name, account_type, account_number, rut, email)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;
            const result = await client.query(query, [
                data.personnel_id,
                data.bank_name,
                data.account_type,
                data.account_number,
                data.rut,
                data.email || null
            ]);
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    async updateBankingInfo(personnelId: number, data: UpdateBankingInfoDTO): Promise<BankingInfo> {
        const client = await pool.connect();
        try {
            const fields: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            if (data.bank_name !== undefined) {
                fields.push(`bank_name = $${paramIndex++}`);
                values.push(data.bank_name);
            }
            if (data.account_type !== undefined) {
                fields.push(`account_type = $${paramIndex++}`);
                values.push(data.account_type);
            }
            if (data.account_number !== undefined) {
                fields.push(`account_number = $${paramIndex++}`);
                values.push(data.account_number);
            }
            if (data.rut !== undefined) {
                fields.push(`rut = $${paramIndex++}`);
                values.push(data.rut);
            }
            if (data.email !== undefined) {
                fields.push(`email = $${paramIndex++}`);
                values.push(data.email);
            }

            fields.push(`updated_at = NOW()`);
            values.push(personnelId);

            const query = `
                UPDATE banking_info 
                SET ${fields.join(', ')}
                WHERE personnel_id = $${paramIndex}
                RETURNING *
            `;

            const result = await client.query(query, values);
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    async deleteBankingInfo(personnelId: number): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('DELETE FROM banking_info WHERE personnel_id = $1', [personnelId]);
        } finally {
            client.release();
        }
    }

    async findAllEmployeesWithBankingInfo(): Promise<EmployeeForPayroll[]> {
        const client = await pool.connect();
        try {
            const query = `
                SELECT 
                    p.id AS personnel_id,
                    p.name,
                    p.rut,
                    COALESCE(SUM(pt.amount), 0) AS current_balance,
                    bi.bank_name,
                    bi.account_type,
                    bi.account_number,
                    bi.email
                FROM personnel p
                JOIN payroll_account pa ON pa.personnel_id = p.id
                JOIN banking_info bi ON bi.personnel_id = p.id
                LEFT JOIN payroll_transaction pt ON pt.payroll_account_id = pa.id
                WHERE p.is_active = true
                GROUP BY p.id, p.name, p.rut, bi.bank_name, bi.account_type, bi.account_number, bi.email
                HAVING COALESCE(SUM(pt.amount), 0) > 0
                ORDER BY p.name
            `;
            const result = await client.query(query);
            return result.rows;
        } finally {
            client.release();
        }
    }

    // ========== PERSONNEL METHODS ==========

    async findPersonnelById(personnelId: number): Promise<Personnel | null> {
        const client = await pool.connect();
        try {
            const query = 'SELECT * FROM personnel WHERE id = $1';
            const result = await client.query(query, [personnelId]);
            return result.rows.length > 0 ? result.rows[0] : null;
        } finally {
            client.release();
        }
    }
}
