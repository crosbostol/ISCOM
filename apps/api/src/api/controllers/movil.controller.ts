import { Request, Response } from 'express';
import { z } from 'zod';
import { MovilService } from '../../services/MovilService';

const createMovilSchema = z.object({
    movil_id: z.string().min(1, 'La Patente es obligatoria'), // Now explicitly mapped to Patente
    external_code: z.string().optional(),
    movil_type: z.string().min(1, 'Tipo es obligatorio'),
    movil_state: z.string().min(1, 'Estado es obligatorio'),
    conductor_id: z.number().nullable().optional()
});

const updateMovilSchema = z.object({
    movil_id: z.string().optional(), // Allow updating ID
    external_code: z.string().optional(),
    movil_type: z.string().optional(),
    movil_state: z.string().optional(),
    conductor_id: z.number().nullable().optional()
});

/**
 * @swagger
 * components:
 *   schemas:
 *     MovilDTO:
 *       type: object
 *       required:
 *         - movil_id
 *         - movil_type
 *         - movil_state
 *       properties:
 *         movil_id:
 *           type: string
 *           description: Identifier (Patente) of the movil
 *         external_code:
 *           type: string
 *           description: External system code
 *         inventory_id:
 *           type: string
 *           description: Internal inventory ID
 *         movil_observations:
 *           type: string
 *           description: Observations or notes
 *         movil_type:
 *           type: string
 *           description: Type of movil (e.g., CIVIL, HIDRAULICA, RETIRO)
 *         movil_state:
 *           type: string
 *           description: Operational state
 *         conductor_id:
 *           type: integer
 *           nullable: true
 *           description: Assigned conductor ID
 *     CreateMovilDTO:
 *       type: object
 *       required:
 *         - movil_id
 *         - movil_type
 *         - movil_state
 *       properties:
 *         movil_id:
 *           type: string
 *         external_code:
 *           type: string
 *         movil_type:
 *           type: string
 *         movil_state:
 *           type: string
 *         conductor_id:
 *           type: integer
 *           nullable: true
 *     UpdateMovilDTO:
 *       type: object
 *       properties:
 *         movil_id:
 *           type: string
 *         external_code:
 *           type: string
 *         movil_type:
 *           type: string
 *         movil_state:
 *           type: string
 *         conductor_id:
 *           type: integer
 *           nullable: true
 */

/**
 * @swagger
 * tags:
 *   name: Movils
 *   description: The movils managing API
 */

export class MovilController {
    private service: MovilService;

    constructor() {
        this.service = new MovilService();
    }

    /**
     * @swagger
     * /moviles:
     *   get:
     *     summary: Returns the list of all movils
     *     tags: [Movils]
     *     responses:
     *       200:
     *         description: The list of movils
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/MovilDTO'
     */
    getAll = async (req: Request, res: Response) => {
        try {
            const moviles = await this.service.getAll();
            res.json(moviles);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };

    /**
     * @swagger
     * /moviles/{id}:
     *   get:
     *     summary: Get movil by id
     *     tags: [Movils]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: The movil id (Patente)
     *     responses:
     *       200:
     *         description: The movil details
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/MovilDTO'
     *       404:
     *         description: The movil was not found
     */
    getById = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const movil = await this.service.getById(id);
            if (!movil) return res.status(404).json({ error: 'Movil not found' });
            res.json(movil);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };

    /**
     * @swagger
     * /moviles:
     *   post:
     *     summary: Create a new movil
     *     tags: [Movils]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateMovilDTO'
     *     responses:
     *       201:
     *         description: The movil was successfully created
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/MovilDTO'
     *       409:
     *         description: Movil ID already exists
     *       400:
     *         description: Validation error
     *       500:
     *         description: Internal Server Error
     */
    create = async (req: Request, res: Response) => {
        try {
            const validated = createMovilSchema.parse(req.body);
            // Default conductor_id to null if not provided
            const data = { ...validated, conductor_id: validated.conductor_id ?? null };

            const movil = await this.service.create(data);
            res.status(201).json(movil);
        } catch (error: any) {
            if ((error as any).errors) {
                return res.status(400).json({ errors: (error as any).errors });
            }
            if (error.message === 'DUPLICATE_ID') {
                return res.status(409).json({ error: 'Movil ID already exists' });
            }
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };

    /**
     * @swagger
     * /moviles/{id}:
     *   put:
     *     summary: Update the movil by id
     *     tags: [Movils]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: The movil id (Patente)
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UpdateMovilDTO'
     *     responses:
     *       200:
     *         description: The movil was updated
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/MovilDTO'
     *       404:
     *         description: The movil was not found
     *       500:
     *         description: Internal Server Error
     */
    update = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const validated = updateMovilSchema.parse(req.body);
            const movil = await this.service.update(id, validated);

            if (!movil) return res.status(404).json({ error: 'Movil not found' });
            res.json(movil);
        } catch (error: any) {
            if ((error as any).errors) {
                return res.status(400).json({ errors: (error as any).errors });
            }
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };

    /**
     * @swagger
     * /moviles/{id}:
     *   delete:
     *     summary: Remove the movil by id
     *     tags: [Movils]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: string
     *         required: true
     *         description: The movil id (Patente)
     *     responses:
     *       204:
     *         description: The movil was deleted
     *       404:
     *         description: The movil was not found
     */
    delete = async (req: Request, res: Response) => {
        try {
            const id = req.params.id;
            const success = await this.service.delete(id);
            if (!success) return res.status(404).json({ error: 'Movil not found' });
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };
}
