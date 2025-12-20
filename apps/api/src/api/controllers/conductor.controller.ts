import { Request, Response } from 'express';
import { z } from 'zod';
import { ConductorService } from '../../services/ConductorService';

const conductorSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    rut: z.string().min(1, 'RUT is required')
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Conductor:
 *       type: object
 *       required:
 *         - id
 *         - name
 *         - rut
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the conductor
 *         name:
 *           type: string
 *           description: The name of the conductor
 *         rut:
 *           type: string
 *           description: The RUT of the conductor (CHILE)
 *     CreateConductorDTO:
 *       type: object
 *       required:
 *         - name
 *         - rut
 *       properties:
 *         name:
 *           type: string
 *         rut:
 *           type: string
 *     UpdateConductorDTO:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         rut:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Conductors
 *   description: The conductors managing API
 */

export class ConductorController {
    private service: ConductorService;

    constructor() {
        this.service = new ConductorService();
    }

    /**
     * @swagger
     * /conductors:
     *   get:
     *     summary: Returns the list of all the conductors
     *     tags: [Conductors]
     *     responses:
     *       200:
     *         description: The list of the conductors
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/Conductor'
     */
    getAll = async (req: Request, res: Response) => {
        try {
            const conductors = await this.service.getAll();
            res.json(conductors);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };

    /**
     * @swagger
     * /conductors/{id}:
     *   get:
     *     summary: Get the conductor by id
     *     tags: [Conductors]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: The conductor id
     *     responses:
     *       200:
     *         description: The conductor description by id
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Conductor'
     *       404:
     *         description: The conductor was not found
     */
    getById = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

            const conductor = await this.service.getById(id);
            if (!conductor) return res.status(404).json({ error: 'Conductor not found' });

            res.json(conductor);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };

    /**
     * @swagger
     * /conductors:
     *   post:
     *     summary: Create a new conductor
     *     tags: [Conductors]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateConductorDTO'
     *     responses:
     *       201:
     *         description: The conductor was successfully created
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Conductor'
     *       409:
     *         description: RUT already exists
     *       500:
     *         description: Internal Server Error
     */
    create = async (req: Request, res: Response) => {
        try {
            const validated = conductorSchema.parse(req.body);
            const conductor = await this.service.create(validated);
            res.status(201).json(conductor);
        } catch (error: any) {
            if ((error as any).errors) {
                return res.status(400).json({ errors: (error as any).errors });
            }
            if (error.message === 'DUPLICATE_RUT') {
                return res.status(409).json({ error: 'RUT already exists' });
            }
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };

    /**
     * @swagger
     * /conductors/{id}:
     *   put:
     *     summary: Update the conductor by the id
     *     tags: [Conductors]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: The conductor id
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UpdateConductorDTO'
     *     responses:
     *       200:
     *         description: The conductor was updated
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Conductor'
     *       404:
     *         description: The conductor was not found
     *       500:
     *         description: Internal Server Error
     */
    update = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

            const validated = conductorSchema.partial().parse(req.body);
            const conductor = await this.service.update(id, validated);

            if (!conductor) return res.status(404).json({ error: 'Conductor not found' });
            res.json(conductor);
        } catch (error: any) {
            if ((error as any).errors) {
                return res.status(400).json({ errors: (error as any).errors });
            }
            if (error.message === 'DUPLICATE_RUT') {
                return res.status(409).json({ error: 'RUT already exists' });
            }
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };

    /**
     * @swagger
     * /conductors/{id}:
     *   delete:
     *     summary: Remove the conductor by id
     *     tags: [Conductors]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: The conductor id
     *     responses:
     *       204:
     *         description: The conductor was deleted
     *       404:
     *         description: The conductor was not found
     */
    delete = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

            const success = await this.service.delete(id);
            if (!success) return res.status(404).json({ error: 'Conductor not found' }); // Or standard 204 if idempotency preferred, but boolean feedback implies check.

            res.status(204).send();
        } catch (error: any) {

            res.status(500).json({ error: 'Internal Server Error' });
        }
    };
}
