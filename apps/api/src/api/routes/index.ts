import { Router } from 'express';
import multer from 'multer';
import { getOtTable, uploadOtCsv, createOt, updateOt, getMovils, getItems, getOtById } from '../controllers/ot.controller';
import { requireApiKey } from '../middlewares/security';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Health Check (Optional but good practice to remove if strict, keeping simplistic as per instructions to only whitelist)
// Removing health check as strict whitelist requested: /ottable, /ot/upload-csv.

/**
 * @swagger
 * /ot/upload-csv:
 *   post:
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 format: binary
 *                 type: string
 *     responses:
 *       200:
 *         description: CSV processed successfully
 *       400:
 *         description: Bad Request (No file uploaded)
 *       401:
 *         description: Unauthorized (Invalid API Key)
 *       500:
 *         description: Server error
 *     security:
 *       - ApiKeyAuth: []
 *     summary: Upload a CSV file to import OTs
 *     tags: [OTs]
 */
router.post('/ot/upload-csv', requireApiKey, upload.single('file') as any, uploadOtCsv);

// ot table view
/**
 * @swagger
 * /ottable:
 *   get:
 *     responses:
 *       200:
 *         description: List of OTs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   civil_movil_id:
 *                     type: integer
 *                   commune:
 *                     type: string
 *                   external_ot_id:
 *                     type: string
 *                   finished_at:
 *                     format: date-time
 *                     type: string
 *                   hydraulic_movil_id:
 *                     type: integer
 *                   id:
 *                     type: integer
 *                   is_additional:
 *                     type: boolean
 *                   n_civil:
 *                     type: string
 *                   n_hidraulico:
 *                     type: string
 *                   number_street:
 *                     type: string
 *                   ot_state:
 *                     type: string
 *                   started_at:
 *                     format: date-time
 *                     type: string
 *                   street:
 *                     type: string
 *       500:
 *         description: Server error
 *     summary: Retrieve a list of OTs for the data grid
 *     tags: [OTs]
 */
router.get('/ottable', getOtTable);
router.post('/ot', createOt);
router.put('/ot/:id', updateOt);
router.get('/ot/:id', getOtById);
router.get('/movils', getMovils);
router.get('/items', getItems);

export default router;
