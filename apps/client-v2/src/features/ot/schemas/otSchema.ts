import { z } from 'zod';

/**
 * Validation Schema for Work Order (OT) Form
 * Supports both Create and Edit modes with step-by-step validation
 */
export const otSchema = z.object({
    // Basic Information (Step 1)
    external_ot_id: z.string().min(1, "El folio OT es obligatorio"),
    street: z.string().min(1, "La calle es obligatoria"),
    number_street: z.string().optional().nullable(),
    commune: z.string().min(1, "La comuna es obligatoria"),
    observation: z.string().optional(),

    // Hydraulic Resource (Step 2)
    hydraulic_movil_id: z.string().optional().nullable(),
    started_at: z.any().optional().nullable(),

    // Civil Resource (Step 3)
    civil_movil_id: z.string().optional().nullable(),
    civil_work_at: z.any().optional().nullable(),

    // Debris/Closure (Optional)
    debris_movil_id: z.string().optional().nullable(),
    debris_date: z.any().optional().nullable(),

    // Items
    items: z.array(z.object({
        item_id: z.coerce.number().min(1, "Seleccione un ítem"),
        quantity: z.preprocess(
            (val) => (typeof val === 'string' ? val.replace(',', '.') : val),
            z.coerce.number().min(0.001, "Cantidad > 0")
        ),
        assigned_movil_id: z.string().optional().nullable()
    }))
}).superRefine((data, ctx) => {
    // Business Rule: If hydraulic or civil movil is assigned, items are required
    const hasHydraulic = !!data.hydraulic_movil_id;
    const hasCivil = !!data.civil_movil_id;

    if ((hasHydraulic || hasCivil) && (!data.items || data.items.length === 0)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Debe agregar al menos un ítem si asigna un móvil Hidráulico o Civil.",
            path: ["items"]
        });
    }
});

export type OTFormValues = z.infer<typeof otSchema>;

/**
 * Validation schemas for individual wizard steps
 * Used for progressive validation
 */
export const stepSchemas = {
    // Step 0: Basic Information
    step0: z.object({
        external_ot_id: z.string().min(1, "El folio OT es obligatorio"),
        street: z.string().min(1, "La calle es obligatoria"),
        number_street: z.string().optional().nullable(),
        commune: z.string().min(1, "La comuna es obligatoria"),
    }),

    // Step 1: Hydraulic Resource (conditional)
    step1: z.object({
        hydraulic_movil_id: z.string().optional().nullable(),
        started_at: z.any().optional().nullable(),
    }),

    // Step 2: Civil Resource (conditional)
    step2: z.object({
        civil_movil_id: z.string().optional().nullable(),
        civil_work_at: z.any().optional().nullable(),
    }),

    // Step 3: Summary (full validation via main schema)
};

/**
 * Helper to get fields to validate for a specific step
 */
export const getStepFields = (step: number): string[] => {
    switch (step) {
        case 0:
            return ['external_ot_id', 'street', 'number_street', 'commune'];
        case 1:
            return ['hydraulic_movil_id', 'started_at'];
        case 2:
            return ['civil_movil_id', 'civil_work_at'];
        default:
            return [];
    }
};
