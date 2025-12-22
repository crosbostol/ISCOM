import { Request, Response } from 'express';
import { OtService } from '../../services/OtService';
import { OtRepository } from '../../data/repositories/OtRepository';

import { MovilRepository } from '../../data/repositories/MovilRepository';
import { ItemRepository } from '../../data/repositories/ItemRepository';
import { ItmOtRepository } from '../../data/repositories/ItmOtRepository';

import { ImportService } from '../../services/ImportService';

// Manual Dependency Injection
const otRepository = new OtRepository();
const movilRepository = new MovilRepository();
const itemRepository = new ItemRepository();
const itmOtRepository = new ItmOtRepository();

const otService = new OtService(otRepository, movilRepository, itemRepository, itmOtRepository);
const importService = new ImportService(otRepository, movilRepository, itemRepository, itmOtRepository);

/**
 * @swagger
 * tags:
 *   description: The OT managing API
 *   name: OTs
 */

export const uploadOtCsv = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).send({ message: 'No file uploaded' });
        }
        const result = await importService.processCsv(req.file.path);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

/**
 * @swagger
 * /ottable:
 *   get:
 *     summary: Retrieve OT table data with filters
 *     tags: [OTs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by OT status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date filter (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date filter (YYYY-MM-DD)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: dateField
 *         schema:
 *           type: string
 *           enum: [started_at, finished_at]
 *         description: Date field to use for range filtering (default started_at)
 *     responses:
 *       200:
 *         description: List of OTs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrdenTrabajoDTO'
 *       500:
 *         description: Server error
 */
export const getOtTable = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || undefined;
        const limit = parseInt(req.query.limit as string) || undefined;
        let offset = undefined;

        if (page && limit) {
            offset = (page - 1) * limit;
        }

        const filters = {
            status: req.query.status as string,
            startDate: req.query.startDate as string,
            endDate: req.query.endDate as string,
            search: req.query.search as string,
            dateField: req.query.dateField as 'started_at' | 'finished_at'
        };

        const result = await otService.getOtTable(limit, offset, filters);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

/**
 * @swagger
 * /ot:
 *   post:
 *     summary: Create a new OT
 *     tags: [OTs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrdenTrabajoDTO'
 *     responses:
 *       200:
 *         description: OT created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrdenTrabajoDTO'
 *       500:
 *         description: Server error
 */
export const createOt = async (req: Request, res: Response) => {
    try {
        const result = await otService.create(req.body);
        res.status(200).send(result);
    } catch (error: any) {
        const status = error.status || 500;
        res.status(status).json({ message: error.message || "Internal Server Error" });
    }
};

/**
 * @swagger
 * /ot/{id}:
 *   put:
 *     summary: Update an existing OT
 *     tags: [OTs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrdenTrabajoDTO'
 *     responses:
 *       200:
 *         description: OT updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrdenTrabajoDTO'
 *       500:
 *         description: Server error
 */
export const updateOt = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const result = await otService.update(id, req.body);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

/**
 * @swagger
 * /ot/{id}:
 *   get:
 *     summary: Get OT by ID
 *     tags: [OTs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: OT details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrdenTrabajoDTO'
 *       404:
 *         description: OT not found
 *       500:
 *         description: Server error
 */
export const getOtById = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        const result = await otService.findById(id);
        if (!result) {
            return res.status(404).json({ message: 'OT not found' });
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json(error);
    }
};

/**
 * @swagger
 * /movils:
 *   get:
 *     summary: Get all movils
 *     tags: [Reference]
 *     responses:
 *       200:
 *         description: List of movils
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   movil_id:
 *                     type: integer
 *                   inventory_id:
 *                     type: string
 *                   movil_type:
 *                     type: string
 *       500:
 *         description: Server error
 */
export const getMovils = async (req: Request, res: Response) => {
    try {
        const result = await otService.getMovils();
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

/**
 * @swagger
 * /items:
 *   get:
 *     summary: Get all items
 *     tags: [Reference]
 *     responses:
 *       200:
 *         description: List of items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   item_id:
 *                     type: integer
 *                   description:
 *                     type: string
 *                   item_type:
 *                     type: string
 *       500:
 *         description: Server error
 */
export const getItems = async (req: Request, res: Response) => {
    try {
        const result = await otService.getItems();
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};
