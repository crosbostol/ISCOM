import { z } from 'zod';

export const CreateOTSchema = z.object({
    external_ot_id: z.string().nullable().optional(),
    street: z.string().min(1, "La calle es obligatoria"),
    number_street: z.string().min(1, "El número es obligatorio"),
    commune: z.string().min(1, "La comuna es obligatoria"),
    started_at: z.string().datetime().optional().nullable(),
    observation: z.string().optional(),
    hydraulic_movil_id: z.string().optional().nullable(),
    civil_movil_id: z.string().optional().nullable(),
    items: z.array(z.object({
        item_id: z.string().min(1, "Seleccione un ítem"),
        quantity: z.number().min(1, "La cantidad debe ser mayor a 0")
    })).optional().default([]),
    debris_date: z.string().datetime().optional().nullable()
}).superRefine((data, ctx) => {
    const hasResource = !!data.hydraulic_movil_id || !!data.civil_movil_id;
    const hasItems = data.items && data.items.length > 0;

    if (hasResource && !hasItems) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Si asigna un móvil técnico (Hidráulico o Civil), es obligatorio ingresar los ítems utilizados.",
            path: ["items"]
        });
    }
});

export const UpdateOTSchema = CreateOTSchema.partial().extend({
    id: z.number().optional()
});

export type CreateOTInput = z.infer<typeof CreateOTSchema>;
export type UpdateOTInput = z.infer<typeof UpdateOTSchema>;
