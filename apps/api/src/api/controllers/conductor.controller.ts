import { Request, Response } from 'express';
import { z } from 'zod';
import { ConductorService } from '../../services/ConductorService';

const conductorSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    rut: z.string().min(1, 'RUT is required')
});

export class ConductorController {
    private service: ConductorService;

    constructor() {
        this.service = new ConductorService();
    }

    getAll = async (req: Request, res: Response) => {
        try {
            const conductors = await this.service.getAll();
            res.json(conductors);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };

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
