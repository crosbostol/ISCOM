import { Request, Response } from 'express';
import { ReportService } from '../services/report.service';

const reportService = new ReportService();

/**
 * @swagger
 * /reports/edp-export:
 *   get:
 *     summary: Export Payment Status Report (Excel)
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Excel file
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Missing parameters
 *       500:
 *         description: Server error
 */
export const exportPaymentStatusExcel = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ message: 'startDate and endDate are required query parameters (YYYY-MM-DD)' });
        }

        const buffer = await reportService.generatePaymentStatusExcel(
            String(startDate),
            String(endDate)
        );

        // Generate Filename: EDP_YYYY_MM_ISCOM.xlsx (Current Date)
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const filename = `EDP_${year}_${month}_ISCOM.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

        // Send Buffer
        res.send(buffer);

    } catch (error) {
        console.error('Error exporting Excel:', error);
        res.status(500).json({ message: 'Error generating report', error: (error as Error).message });
    }
};
