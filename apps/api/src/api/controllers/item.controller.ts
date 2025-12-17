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

export class ItemController {
    private service: ItemService;

    constructor() {
        this.service = new ItemService();
    }

    getAll = async (req: Request, res: Response) => {
        try {
            const items = await this.service.getAll();
            res.json(items);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };

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
