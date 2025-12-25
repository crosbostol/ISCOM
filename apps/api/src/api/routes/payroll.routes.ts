import { Router } from 'express';
import { PayrollController } from '../controllers/payroll.controller';
import { PayrollService } from '../../services/PayrollService';
import { requireManagerRole } from '../middlewares/requireManagerRole';

const router = Router();
const payrollService = new PayrollService();
const controller = new PayrollController(payrollService);

// Apply manager role restriction to ALL payroll routes
router.use(requireManagerRole);

// Payroll account routes
router.get('/', controller.getAllAccounts.bind(controller));
router.post('/account', controller.createAccount.bind(controller));
router.get('/:personnelId/ledger', controller.getEmployeeLedger.bind(controller));

// Transaction routes
router.post('/transaction', controller.createTransaction.bind(controller));

// Banking info routes
router.get('/bank-info/:personnelId', controller.getBankingInfo.bind(controller));
router.post('/bank-info', controller.createBankingInfo.bind(controller));
router.put('/bank-info/:personnelId', controller.updateBankingInfo.bind(controller));
router.delete('/bank-info/:personnelId', controller.deleteBankingInfo.bind(controller));

// Export routes
router.post('/export/santander-transfer', controller.exportSantanderTransfer.bind(controller));

// Summary route
router.get('/summary', controller.getPayrollSummary.bind(controller));

export default router;
