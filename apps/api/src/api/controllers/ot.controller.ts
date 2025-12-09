import { Request, Response } from 'express';
import { OtService } from '../../services/OtService';
import { OtRepository } from '../../data/repositories/OtRepository';
import { OrdenTrabajoDTO } from '../../data/dto/OrdenTrabajoDTO';

import { MovilRepository } from '../../data/repositories/MovilRepository';
import { ItemRepository } from '../../data/repositories/ItemRepository';
import { ItmOtRepository } from '../../data/repositories/ItmOtRepository';

// Manual Dependency Injection
const otRepository = new OtRepository();
const movilRepository = new MovilRepository();
const itemRepository = new ItemRepository();
const itmOtRepository = new ItmOtRepository();

const otService = new OtService(otRepository, movilRepository, itemRepository, itmOtRepository);

/**
 * @swagger
 * tags:
 *   name: OTs
 *   description: The OT managing API
 */

/**
 * @swagger
 * /ot:
 *   get:
 *     summary: Returns the list of all the OTs
 *     tags: [OTs]
 *     responses:
 *       200:
 *         description: The list of the OTs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/OrdenTrabajoDTO'
 */
export const getOt = async (req: Request, res: Response) => {
    try {
        const result = await otService.getAllOts();
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
 *       201:
 *         description: The created OT
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OrdenTrabajoDTO'
 *       500:
 *         description: Some server error
 */
export const postOt = async (req: Request, res: Response) => {
    try {
        const data: OrdenTrabajoDTO = req.body;
        // Basic validation: if external_ot_id is provided, check uniqueness (DB handles constraint, but we could check here)
        const result = await otService.createOt(data);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const uploadOtCsv = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).send({ message: 'No file uploaded' });
        }
        const result = await otService.processCsv(req.file.path);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const getOtById = async (req: Request, res: Response) => {
    try {
        const { ot_id } = req.params;
        const id = parseInt(ot_id);
        if (isNaN(id)) {
            return res.status(400).send({ message: 'Invalid ID format. Must be a number.' });
        }
        const result = await otService.getOtById(id);
        if (!result) {
            return res.status(404).send({ message: 'OT not found' });
        }
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const updateOt = async (req: Request, res: Response) => {
    try {
        const { ot_id } = req.params;
        const id = parseInt(ot_id);
        const data: Partial<OrdenTrabajoDTO> = req.body;
        const result = await otService.updateOt(id, data);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const RejectOtById = async (req: Request, res: Response) => {
    try {
        const { ot_id } = req.params;
        const id = parseInt(ot_id);
        const result = await otService.rejectOt(id);
        if (!result) {
            return res.json({
                message: `Ot ${ot_id} ya está desetimada`,
                body: { user: { ot_id } }
            });
        }
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const getOtTable = async (req: Request, res: Response) => {
    try {
        const result = await otService.getOtTable();
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const getOtTableByState = async (req: Request, res: Response) => {
    try {
        const { state } = req.params;
        const result = await otService.getOtTableByState(state);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const getFinishedOtsByRangeDate = async (req: Request, res: Response) => {
    try {
        const { date_start, date_finished } = req.params;
        const result = await otService.getFinishedOtsByRangeDate(date_start, date_finished);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const getRejectedOts = async (req: Request, res: Response) => {
    try {
        const result = await otService.getRejectedOts();
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const getOtsByState = async (req: Request, res: Response) => {
    try {
        const { state } = req.params;
        const result = await otService.getOtsByState(state);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};
