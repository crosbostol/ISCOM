import { PayrollRepository, CreateTransactionDTO, CreateBankingInfoDTO, UpdateBankingInfoDTO, PayrollAccountWithBalance, PayrollLedgerEntry, EmployeeForPayroll } from '../data/repositories/PayrollRepository';
import ExcelJS from 'exceljs';
import { NotFoundError, ValidationError, ConflictError, BadRequestError, ConfigurationError } from '../utils/AppError';

// ============================================================
// BANK SBIF CODES (Chile)
// ============================================================

export const BANK_SBIF_CODES: Record<string, string> = {
    'BANCO DE CHILE': '001',
    'BANCO INTERNACIONAL': '009',
    'BANCO DEL ESTADO': '012',
    'SCOTIABANK': '014',
    'BANCO BCI': '016',
    'BANCO BICE': '028',
    'HSBC BANK': '031',
    'BANCO SANTANDER': '037', // Leave empty in export if destination is also Santander
    'ITAU': '039',
    'BANCO SECURITY': '049',
    'BANCO FALABELLA': '051',
    'BANCO RIPLEY': '053',
    'BANCO CONSORCIO': '055'
};

// ============================================================
// SERVICE CLASS
// ============================================================

export class PayrollService {
    private repository: PayrollRepository;

    constructor() {
        this.repository = new PayrollRepository();
    }

    // ========== PAYROLL ACCOUNT METHODS ==========

    async getAllAccountsWithBalances(): Promise<PayrollAccountWithBalance[]> {
        return this.repository.findAllAccountsWithBalance();
    }

    async getEmployeeLedger(personnelId: number): Promise<PayrollLedgerEntry[]> {
        // First, verify personnel exists and get their account
        const account = await this.repository.findAccountByEmployeeId(personnelId);
        if (!account) {
            throw new NotFoundError('Employee has no payroll account', 'EMPLOYEE_NO_PAYROLL_ACCOUNT');
        }

        return this.repository.findTransactionsByAccountId(account.id);
    }

    async createAccountForEmployee(personnelId: number, baseSalary: number) {
        // Verify personnel exists
        const personnel = await this.repository.findPersonnelById(personnelId);
        if (!personnel) {
            throw new NotFoundError('Personnel not found', 'PERSONNEL_NOT_FOUND');
        }

        // Verify no existing account
        const existing = await this.repository.findAccountByEmployeeId(personnelId);
        if (existing) {
            throw new ConflictError('Payroll account already exists for this employee', 'PAYROLL_ACCOUNT_ALREADY_EXISTS');
        }

        return this.repository.createAccount({
            personnel_id: personnelId,
            base_salary: baseSalary
        });
    }

    // ========== TRANSACTION METHODS ==========

    async registerTransaction(personnelId: number, data: Omit<CreateTransactionDTO, 'payroll_account_id'>): Promise<any> {
        // Verify personnel has a payroll account
        const account = await this.repository.findAccountByEmployeeId(personnelId);
        if (!account) {
            throw new NotFoundError('Employee has no payroll account', 'EMPLOYEE_NO_PAYROLL_ACCOUNT');
        }

        // Validate amount based on transaction type
        const debitTypes = ['ADVANCE', 'ABSENCE', 'LOAN'];
        const creditTypes = ['SALARY', 'BONUS'];

        if (debitTypes.includes(data.transaction_type)) {
            if (data.amount >= 0) {
                throw new ValidationError(
                    'Debit transactions (ADVANCE, ABSENCE, LOAN) must have negative amounts',
                    'DEBIT_AMOUNT_MUST_BE_NEGATIVE'
                );
            }
        } else if (creditTypes.includes(data.transaction_type)) {
            if (data.amount <= 0) {
                throw new ValidationError(
                    'Credit transactions (SALARY, BONUS) must have positive amounts',
                    'CREDIT_AMOUNT_MUST_BE_POSITIVE'
                );
            }
        }

        // Create transaction with the account ID
        return this.repository.createTransaction({
            ...data,
            payroll_account_id: account.id
        });
    }

    // ========== BANKING INFO METHODS ==========

    /**
     * Validates that account number contains only digits and meets length requirements
     * Chilean bank account numbers are typically 4-20 digits
     */
    private validateAccountNumber(accountNumber: string): void {
        // Check if contains only digits
        if (!/^\d+$/.test(accountNumber)) {
            throw new ValidationError(
                'Account number must contain only digits after normalization',
                'INVALID_ACCOUNT_NUMBER_FORMAT'
            );
        }

        // Check length (Chilean bank accounts are typically 4-20 digits)
        if (accountNumber.length < 4 || accountNumber.length > 20) {
            throw new ValidationError(
                'Account number must be between 4 and 20 digits',
                'INVALID_ACCOUNT_NUMBER_LENGTH'
            );
        }
    }

    async getBankingInfo(personnelId: number) {
        const bankingInfo = await this.repository.findBankingInfoByEmployeeId(personnelId);
        if (!bankingInfo) {
            throw new NotFoundError('Banking information not found for this employee', 'BANKING_INFO_NOT_FOUND');
        }
        return bankingInfo;
    }

    async createBankingInfo(data: CreateBankingInfoDTO) {
        // Verify personnel exists
        const personnel = await this.repository.findPersonnelById(data.personnel_id);
        if (!personnel) {
            throw new NotFoundError('Personnel not found', 'PERSONNEL_NOT_FOUND');
        }

        // Validate RUT matches
        if (data.rut !== personnel.rut) {
            throw new ValidationError(
                'RUT does not match personnel RUT',
                'RUT_MISMATCH'
            );
        }

        // Check for existing banking info
        const existing = await this.repository.findBankingInfoByEmployeeId(data.personnel_id);
        if (existing) {
            throw new ConflictError('Banking info already exists. Use PUT to update.', 'BANKING_INFO_ALREADY_EXISTS');
        }

        // Normalize account number (remove hyphens and spaces)
        const normalizedAccountNumber = data.account_number.replace(/[\s-]/g, '');

        // Validate normalized account number
        this.validateAccountNumber(normalizedAccountNumber);

        const normalizedData = {
            ...data,
            account_number: normalizedAccountNumber
        };

        return this.repository.createBankingInfo(normalizedData);
    }

    async updateBankingInfo(personnelId: number, data: UpdateBankingInfoDTO) {
        // Verify banking info exists
        const existing = await this.repository.findBankingInfoByEmployeeId(personnelId);
        if (!existing) {
            throw new NotFoundError('Banking information not found', 'BANKING_INFO_NOT_FOUND');
        }

        // If RUT is being updated, validate it matches personnel
        if (data.rut) {
            const personnel = await this.repository.findPersonnelById(personnelId);
            if (personnel && data.rut !== personnel.rut) {
                throw new ValidationError('RUT does not match personnel RUT', 'RUT_MISMATCH');
            }
        }

        // Normalize and validate account number if provided
        if (data.account_number) {
            const normalized = data.account_number.replace(/[\s-]/g, '');
            this.validateAccountNumber(normalized);
            data.account_number = normalized;
        }

        return this.repository.updateBankingInfo(personnelId, data);
    }

    async deleteBankingInfo(personnelId: number) {
        // Verify exists before deleting
        const existing = await this.repository.findBankingInfoByEmployeeId(personnelId);
        if (!existing) {
            throw new NotFoundError('Banking information not found', 'BANKING_INFO_NOT_FOUND');
        }

        return this.repository.deleteBankingInfo(personnelId);
    }

    // ========== EXCEL EXPORT METHOD ==========

    async generateSantanderTransferExcel(auditContext?: {
        userId?: number;
        ipAddress?: string;
        userAgent?: string;
    }): Promise<Buffer> {
        // Read source account from environment variable
        const sourceAccount = process.env.SANTANDER_SOURCE_ACCOUNT;
        if (!sourceAccount) {
            throw new ConfigurationError(
                'SANTANDER_SOURCE_ACCOUNT environment variable is not configured',
                'MISSING_SANTANDER_CONFIG'
            );
        }

        // Get all eligible employees (positive balance + banking info)
        const employees = await this.repository.findAllEmployeesWithBankingInfo();

        if (employees.length === 0) {
            throw new BadRequestError(
                'No employees eligible for payroll (need positive balance and banking info)',
                'NO_ELIGIBLE_EMPLOYEES'
            );
        }

        // Calculate total amount for audit log
        const totalAmount = employees.reduce((sum, emp) => sum + emp.current_balance, 0);

        // Create workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Nómina');

        // Define columns
        worksheet.columns = [
            { header: 'Cuenta Origen', key: 'source_account', width: 15 },
            { header: 'Moneda Origen', key: 'source_currency', width: 15 },
            { header: 'Cuenta Destino', key: 'dest_account', width: 20 },
            { header: 'Moneda Destino', key: 'dest_currency', width: 15 },
            { header: 'Código Banco Destino', key: 'dest_bank_code', width: 20 },
            { header: 'RUT Beneficiario', key: 'beneficiary_rut', width: 15 },
            { header: 'Monto', key: 'amount', width: 15 },
            { header: 'Email Beneficiario', key: 'email', width: 30 }
        ];

        // Add rows
        employees.forEach(employee => {
            const bankCode = this.getBankSBIFCode(employee.bank_name);

            worksheet.addRow({
                source_account: sourceAccount,
                source_currency: 'CLP',
                dest_account: employee.account_number,
                dest_currency: 'CLP',
                dest_bank_code: bankCode,
                beneficiary_rut: employee.rut,
                amount: employee.current_balance,
                email: employee.email || ''
            });
        });

        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD9D9D9' }
        };

        // Generate buffer
        const buffer = await workbook.xlsx.writeBuffer();

        // ========== AUDIT LOGGING ==========
        // Log the export operation for compliance and security
        await this.repository.createAuditLog({
            user_id: auditContext?.userId,
            action_type: 'PAYROLL_EXPORT',
            action_description: `Exported Santander transfer Excel with ${employees.length} employees, total amount: CLP ${totalAmount.toLocaleString('es-CL')}`,
            metadata: {
                export_type: 'santander_transfer',
                employee_count: employees.length,
                total_amount: totalAmount,
                personnel_ids: employees.map(e => e.personnel_id),
                timestamp: new Date().toISOString()
            },
            ip_address: auditContext?.ipAddress,
            user_agent: auditContext?.userAgent
        });

        return Buffer.from(buffer);
    }

    private getBankSBIFCode(bankName: string): string {
        const code = BANK_SBIF_CODES[bankName.toUpperCase()];

        // If destination is Santander, leave code empty
        if (code === '037') {
            return '';
        }

        return code || '';
    }

    // ========== SUMMARY METHODS ==========

    async getPayrollSummary() {
        const accounts = await this.repository.findAllAccountsWithBalance();

        const totalEmployees = accounts.length;
        const totalPositiveBalance = accounts
            .filter(a => a.current_balance > 0)
            .reduce((sum, a) => sum + a.current_balance, 0);
        const totalNegativeBalance = accounts
            .filter(a => a.current_balance < 0)
            .reduce((sum, a) => sum + Math.abs(a.current_balance), 0);

        return {
            total_employees: totalEmployees,
            employees_with_positive_balance: accounts.filter(a => a.current_balance > 0).length,
            employees_with_negative_balance: accounts.filter(a => a.current_balance < 0).length,
            total_positive_balance: totalPositiveBalance,
            total_negative_balance: totalNegativeBalance,
            net_balance: totalPositiveBalance - totalNegativeBalance
        };
    }
}
