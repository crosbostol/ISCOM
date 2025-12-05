import { Request, Response } from 'express';
import { OtService } from '../../services/OtService';
import { OtRepository } from '../../data/repositories/OtRepository';
import { OrdenTrabajoDTO } from '../../data/dto/OrdenTrabajoDTO';

// Manual Dependency Injection
const otRepository = new OtRepository();
const otService = new OtService(otRepository);

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
        const result = await otService.createOt(data);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const getOtById = async (req: Request, res: Response) => {
    try {
        const { ot_id } = req.params;
        const result = await otService.getOtById(ot_id);
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
        const data: Partial<OrdenTrabajoDTO> = req.body;
        const result = await otService.updateOt(ot_id, data);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const RejectOtById = async (req: Request, res: Response) => {
    try {
        const { ot_id } = req.params;
        const result = await otService.rejectOt(ot_id);
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
