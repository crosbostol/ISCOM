import { Request, Response } from 'express';
import { z } from 'zod';
import { ItemService } from '../../services/ItemService';

const createItemSchema = z.object({
    // item_id removed (auto-generated)
    description: z.string().min(1, 'Descripción es obligatoria'),
    item_value: z.number().positive('El valor debe ser positivo'),
    item_type: z.string().optional(),
    item_unit: z.string().optional()
});

const updateItemSchema = createItemSchema.partial();

/**
 * @swagger
 * components:
 *   schemas:
 *     ItemDTO:
 *       type: object
 *       required:
 *         - item_id
 *         - description
 *         - item_value
 *       properties:
 *         item_id:
 *           type: integer
 *           description: The auto-generated id of the item
 *         description:
 *           type: string
 *           description: The description of the item
 *         item_value:
 *           type: number
 *           description: The unit price of the item
 *         item_type:
 *           type: string
 *           description: Type/Category of the item
 *         item_unit:
 *           type: string
 *           description: Unit of measurement (e.g., m3, gl, un)
 *     CreateItemDTO:
 *       type: object
 *       required:
 *         - description
 *         - item_value
 *       properties:
 *         description:
 *           type: string
 *         item_value:
 *           type: number
 *         item_type:
 *           type: string
 *         item_unit:
 *           type: string
 *     UpdateItemDTO:
 *       type: object
 *       properties:
 *         description:
 *           type: string
 *         item_value:
 *           type: number
 *         item_type:
 *           type: string
 *         item_unit:
 *           type: string
 */

/**
 * @swagger
 * tags:
 *   name: Items
 *   description: The items managing API
 */

export class ItemController {
    private service: ItemService;

    constructor() {
        this.service = new ItemService();
    }

    /**
     * @swagger
     * /items:
     *   get:
     *     summary: Returns the list of all items
     *     tags: [Items]
     *     responses:
     *       200:
     *         description: The list of items
     *         content:
     *           application/json:
     *             schema:
     *               type: array
     *               items:
     *                 $ref: '#/components/schemas/ItemDTO'
     */
    getAll = async (req: Request, res: Response) => {
        try {
            const items = await this.service.getAll();
            res.json(items);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };

    /**
     * @swagger
     * /items/{id}:
     *   get:
     *     summary: Get item by id
     *     tags: [Items]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: The item id
     *     responses:
     *       200:
     *         description: The item description by id
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ItemDTO'
     *       404:
     *         description: The item was not found
     */
    getById = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

            const item = await this.service.getById(id);
            if (!item) return res.status(404).json({ error: 'Item not found' });
            res.json(item);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };

    /**
     * @swagger
     * /items:
     *   post:
     *     summary: Create a new item
     *     tags: [Items]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/CreateItemDTO'
     *     responses:
     *       201:
     *         description: The item was successfully created
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ItemDTO'
     *       400:
     *         description: Validation error
     *       500:
     *         description: Internal Server Error
     */
    create = async (req: Request, res: Response) => {
        try {
            const validated = createItemSchema.parse(req.body);
            const item = await this.service.create(validated);
            res.status(201).json(item);
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: (error as any).errors });
            }
            // Removed DUPLICATE_ID handling
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };

    /**
     * @swagger
     * /items/{id}:
     *   put:
     *     summary: Update the item by the id
     *     tags: [Items]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: The item id
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/UpdateItemDTO'
     *     responses:
     *       200:
     *         description: The item was updated
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ItemDTO'
     *       404:
     *         description: The item was not found
     *       500:
     *         description: Internal Server Error
     */
    update = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

            const validated = updateItemSchema.parse(req.body);
            const item = await this.service.update(id, validated);

            if (!item) return res.status(404).json({ error: 'Item not found' });
            res.json(item);
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: (error as any).errors });
            }
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };

    /**
     * @swagger
     * /items/{id}:
     *   delete:
     *     summary: Remove the item by id
     *     tags: [Items]
     *     parameters:
     *       - in: path
     *         name: id
     *         schema:
     *           type: integer
     *         required: true
     *         description: The item id
     *     responses:
     *       204:
     *         description: The item was deleted
     *       404:
     *         description: The item was not found
     */
    delete = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

            const success = await this.service.delete(id);
            if (!success) return res.status(404).json({ error: 'Item not found' });
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };
}
