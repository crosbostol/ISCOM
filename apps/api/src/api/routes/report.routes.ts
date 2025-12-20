import { Router } from 'express';
import { exportPaymentStatusExcel } from '../controllers/report.controller';
import { requireApiKey } from '../middlewares/security';

const router = Router();

// Endpoint: GET /api/reports/edp-export
// Protected by API Key (inherited from index or explicit usage)
// Note: index.ts applies requireApiKey globally to protected routes section.

router.get('/edp-export', exportPaymentStatusExcel);

export default router;
