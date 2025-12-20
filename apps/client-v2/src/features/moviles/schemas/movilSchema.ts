import { z } from 'zod';

export const MOVIL_TYPES = ['OBRA CIVIL', 'HIDRAULICO', 'RETIRO'] as const;
export const MOVIL_STATES = ['OPERATIVO', 'EN MANTENCION', 'EN_TALLER', 'BAJA', 'FUERA DE SERVICIO'] as const;

export const movilSchema = z.object({
    movil_id: z.string()
        .min(1, 'La Patente es obligatoria')
        .transform(val => val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()),
    external_code: z.string().optional(),
    movil_type: z.enum(MOVIL_TYPES, {
        message: 'Tipo de vehículo inválido'
    }),
    movil_state: z.enum(MOVIL_STATES, {
        message: 'Estado inválido'
    }),
    conductor_id: z.preprocess(
        (val) => {
            if (val === '' || val === '0' || val === 0) return null;
            return val;
        },
        z.coerce.number().nullable().optional()
    ),
});

export type MovilFormData = z.infer<typeof movilSchema>;
