import { z } from 'zod';

export const OtSchema = z.object({
    street: z.string().min(1, "Street is required"),
    number_street: z.string().min(1, "Street number is required"),
    commune: z.string().min(1, "Commune is required"),
    fuga_location: z.string().optional(),
    started_at: z.string().datetime().optional(), // Expecting ISO string
    finished_at: z.string().datetime().optional(),
    hydraulic_movil_id: z.number().int().optional(),
    civil_movil_id: z.number().int().optional(),
    ot_state: z.string().optional(),
    dismissed: z.boolean().optional()
});
