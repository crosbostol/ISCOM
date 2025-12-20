import { z } from 'zod';
import { cleanRut, formatRut, validateRut } from '../../../utils/rutValidation';

export const conductorSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio'),
    rut: z.string()
        .min(1, 'El RUT es obligatorio')
        .transform((val) => {
            const cleaned = cleanRut(val);
            return formatRut(cleaned).replace(/\./g, ''); // Guardar como XXXXXXXX-Y
        })
        .refine((val) => validateRut(val), { message: "RUT inválido" }),
});

export type ConductorFormData = z.infer<typeof conductorSchema>;
