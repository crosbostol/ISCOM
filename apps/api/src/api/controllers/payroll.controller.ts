import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { PayrollService } from '../../services/PayrollService';
import { AppError, NotFoundError, ValidationError, ConflictError, BadRequestError, ConfigurationError } from '../../utils/AppError';

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const createAccountSchema = z.object({
    personnel_id: z.number().int().positive(),
    base_salary: z.number().int().positive()
});

const createTransactionSchema = z.object({
    employee_id: z.number().int().positive(),
    type: z.enum(['ADVANCE', 'ABSENCE', 'BONUS', 'SALARY', 'LOAN']),
    amount: z.number().int(),
    description: z.string().max(500).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) // YYYY-MM-DD
});

const createBankingInfoSchema = z.object({
    personnel_id: z.number().int().positive(),
    bank_name: z.string().min(1).max(50),
    account_type: z.enum(['CUENTA_CORRIENTE', 'CUENTA_VISTA', 'CUENTA_RUT']),
    account_number: z.string().min(1).max(20),
    rut: z.string().regex(/^\d{7,8}-[\dkK]$/),
    email: z.string().email().optional()
});

const updateBankingInfoSchema = z.object({
    bank_name: z.string().min(1).max(50).optional(),
    account_type: z.enum(['CUENTA_CORRIENTE', 'CUENTA_VISTA', 'CUENTA_RUT']).optional(),
    account_number: z.string().min(1).max(20).optional(),
    rut: z.string().regex(/^\d{7,8}-[\dkK]$/).optional(),
    email: z.string().email().optional()
});

/**
 * @swagger
 * components:
 *   schemas:
 *     PayrollAccountSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         personnel_id:
 *           type: integer
 *         employee_name:
 *           type: string
 *         employee_rut:
 *           type: string
 *         employee_role:
 *           type: string
 *         base_salary:
 *           type: integer
 *         current_balance:
 *           type: integer
 *     PayrollTransactionDTO:
 *       type: object
 *       required:
 *         - employee_id
 *         - type
 *         - amount
 *         - date
 *       properties:
 *         employee_id:
 *           type: integer
 *         type:
 *           type: string
 *           enum: [ADVANCE, ABSENCE, BONUS, SALARY, LOAN]
 *         amount:
 *           type: integer
 *         description:
 *           type: string
 *         date:
 *           type: string
 *           format: date
 *     PayrollLedgerEntry:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         transaction_date:
 *           type: string
 *           format: date
 *         transaction_type:
 *           type: string
 *         amount:
 *           type: integer
 *         description:
 *           type: string
 *         created_by_username:
 *           type: string
 *     BankingInfoDTO:
 *       type: object
 *       required:
 *         - personnel_id
 *         - bank_name
 *         - account_type
 *         - account_number
 *         - rut
 *       properties:
 *         personnel_id:
 *           type: integer
 *         bank_name:
 *           type: string
 *         account_type:
 *           type: string
 *           enum: [CUENTA_CORRIENTE, CUENTA_VISTA, CUENTA_RUT]
 *         account_number:
 *           type: string
 *         rut:
 *           type: string
 *         email:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Payroll
 *   description: Employee payroll and salary management (MANAGER/ADMIN only)
 */

export class PayrollController {
    constructor(private payrollService: PayrollService) { }

    /**
     * @swagger
     * /payroll:
     *   get:
     *     summary: List all employees with their payroll balance
     *     tags: [Payroll]
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: List of employees with balances
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/PayrollAccountSummary'
     *       401:
     *         description: Unauthorized
     *       403:
     *         description: Forbidden - Insufficient privileges
     */
    async getAllAccounts(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const accounts = await this.payrollService.getAllAccountsWithBalances();
            res.json(accounts);
        } catch (error) {
            next(error);
        }
    }

    /**
     * @swagger
     * /payroll/{personnelId}/ledger:
     *   get:
     *     summary: Get employee salary ledger (transaction history)
     *     tags: [Payroll]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: personnelId
     *         required: true
     *         schema:
     *           type: integer
     *         description: Personnel ID
     *     responses:
     *       200:
     *         description: Employee ledger entries
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/PayrollLedgerEntry'
     *       404:
     *         description: Employee not found or no payroll account
     */
    async getEmployeeLedger(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const personnelId = parseInt(req.params.personnelId);
            const ledger = await this.payrollService.getEmployeeLedger(personnelId);
            res.json(ledger);
        } catch (error) {
            if (error instanceof NotFoundError) {
                res.status(404).json({ error: error.message });
            } else {
                next(error);
            }
        }
    }

    /**
     * @swagger
     * /payroll/account:
     *   post:
     *     summary: Create payroll account for an employee
     *     tags: [Payroll]
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - personnel_id
     *               - base_salary
     *             properties:
     *               personnel_id:
     *                 type: integer
     *               base_salary:
     *                 type: integer
     *     responses:
     *       201:
     *         description: Payroll account created
     *       400:
     *         description: Validation error
     *       409:
     *         description: Payroll account already exists for this employee
     */
    async createAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validated = createAccountSchema.parse(req.body);
            const account = await this.payrollService.createAccountForEmployee(
                validated.personnel_id,
                validated.base_salary
            );
            res.status(201).json(account);
        } catch (error) {
            if (error instanceof NotFoundError) {
                res.status(404).json({ error: error.message });
            } else if (error instanceof ConflictError) {
                res.status(409).json({ error: error.message });
            } else {
                next(error);
            }
        }
    }

    /**
     * @swagger
     * /payroll/transaction:
     *   post:
     *     summary: Register a payroll transaction (debit or credit)
     *     tags: [Payroll]
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/PayrollTransactionDTO'
     *     responses:
     *       201:
     *         description: Transaction registered
     *       400:
     *         description: Validation error (e.g., negative amount for credit)
     */
    async createTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validated = createTransactionSchema.parse(req.body);

            // Call service with personnelId - service will validate account exists
            const transaction = await this.payrollService.registerTransaction(
                validated.employee_id,
                {
                    transaction_date: new Date(validated.date),
                    transaction_type: validated.type,
                    amount: validated.amount,
                    description: validated.description,
                    created_by_user_id: req.user?.id
                }
            );

            res.status(201).json(transaction);
        } catch (error) {
            if (error instanceof NotFoundError) {
                res.status(404).json({ error: error.message });
            } else if (error instanceof ValidationError) {
                res.status(400).json({ error: error.message });
            } else {
                next(error);
            }
        }
    }

    /**
     * @swagger
     * /payroll/bank-info/{personnelId}:
     *   get:
     *     summary: Get employee banking information
     *     tags: [Payroll]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: personnelId
     *         required: true
     *         schema:
     *           type: integer
     *     responses:
     *       200:
     *         description: Banking information
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/BankingInfoDTO'
     *       404:
     *         description: Banking info not found
     */
    async getBankingInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const personnelId = parseInt(req.params.personnelId);
            const bankingInfo = await this.payrollService.getBankingInfo(personnelId);
            res.json(bankingInfo);
        } catch (error) {
            if (error instanceof NotFoundError) {
                res.status(404).json({ error: error.message });
            } else {
                next(error);
            }
        }
    }

    /**
     * @swagger
     * /payroll/bank-info:
     *   post:
     *     summary: Create or update employee banking information
     *     tags: [Payroll]
     *     security:
     *       - BearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/BankingInfoDTO'
     *     responses:
     *       201:
     *         description: Banking info created
     *       400:
     *         description: Validation error (e.g., RUT mismatch)
     *       409:
     *         description: Banking info already exists (use PUT to update)
     */
    async createBankingInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const validated = createBankingInfoSchema.parse(req.body);
            const bankingInfo = await this.payrollService.createBankingInfo(validated);
            res.status(201).json(bankingInfo);
        } catch (error) {
            if (error instanceof NotFoundError) {
                res.status(404).json({ error: error.message });
            } else if (error instanceof ValidationError) {
                res.status(400).json({ error: error.message });
            } else if (error instanceof ConflictError) {
                res.status(409).json({ error: error.message });
            } else {
                next(error);
            }
        }
    }

    /**
     * @swagger
     * /payroll/bank-info/{personnelId}:
     *   put:
     *     summary: Update employee banking information
     *     tags: [Payroll]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: personnelId
     *         required: true
     *         schema:
     *           type: integer
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               bank_name:
     *                 type: string
     *               account_type:
     *                 type: string
     *               account_number:
     *                 type: string
     *               rut:
     *                 type: string
     *               email:
     *                 type: string
     *     responses:
     *       200:
     *         description: Banking info updated
     *       404:
     *         description: Banking info not found
     */
    async updateBankingInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const personnelId = parseInt(req.params.personnelId);
            const validated = updateBankingInfoSchema.parse(req.body);
            const bankingInfo = await this.payrollService.updateBankingInfo(personnelId, validated);
            res.json(bankingInfo);
        } catch (error) {
            if (error instanceof NotFoundError) {
                res.status(404).json({ error: error.message });
            } else if (error instanceof ValidationError) {
                res.status(400).json({ error: error.message });
            } else {
                next(error);
            }
        }
    }

    /**
     * @swagger
     * /payroll/bank-info/{personnelId}:
     *   delete:
     *     summary: Delete employee banking information
     *     tags: [Payroll]
     *     security:
     *       - BearerAuth: []
     *     parameters:
     *       - in: path
     *         name: personnelId
     *         required: true
     *         schema:
     *           type: integer
     *     responses:
     *       204:
     *         description: Banking info deleted
     *       404:
     *         description: Banking info not found
     */
    async deleteBankingInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const personnelId = parseInt(req.params.personnelId);
            await this.payrollService.deleteBankingInfo(personnelId);
            res.status(204).send();
        } catch (error) {
            if (error instanceof NotFoundError) {
                res.status(404).json({ error: error.message });
            } else {
                next(error);
            }
        }
    }

    /**
     * @swagger
     * /payroll/export/santander-transfer:
     *   post:
     *     summary: Generate Excel file for Santander mass transfers
     *     tags: [Payroll]
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: Excel file generated
     *         content:
     *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
     *             schema:
     *               type: string
     *               format: binary
     *       400:
     *         description: No eligible employees found
     *       500:
     *         description: Configuration error (missing SANTANDER_SOURCE_ACCOUNT env var)
     */
    async exportSantanderTransfer(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Pass audit context for security logging
            const excelBuffer = await this.payrollService.generateSantanderTransferExcel({
                userId: req.user?.id,
                ipAddress: req.ip || req.socket.remoteAddress,
                userAgent: req.get('user-agent')
            });

            // Generate filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
            const filename = `nomina_${timestamp}.xlsx`;

            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.send(excelBuffer);
        } catch (error) {
            if (error instanceof BadRequestError) {
                res.status(400).json({ error: error.message });
            } else if (error instanceof ConfigurationError) {
                res.status(500).json({ error: error.message });
            } else {
                next(error);
            }
        }
    }

    /**
     * @swagger
     * /payroll/summary:
     *   get:
     *     summary: Get payroll summary statistics
     *     tags: [Payroll]
     *     security:
     *       - BearerAuth: []
     *     responses:
     *       200:
     *         description: Payroll summary
     */
    async getPayrollSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const summary = await this.payrollService.getPayrollSummary();
            res.json(summary);
        } catch (error) {
            next(error);
        }
    }
}
