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

export class MovilController {
    private service: MovilService;

    constructor() {
        this.service = new MovilService();
    }

    getAll = async (req: Request, res: Response) => {
        try {
            const moviles = await this.service.getAll();
            res.json(moviles);
        } catch (error) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    };

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
