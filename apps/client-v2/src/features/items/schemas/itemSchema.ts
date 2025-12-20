import { z } from 'zod';

export const itemSchema = z.object({
    description: z.string().min(1, 'La descripción es obligatoria'),
    item_value: z.number().min(0, 'El valor debe ser mayor o igual a 0'),
    item_type: z.string().optional(),
    // item_unit is in DTO but was not in previous modal. 
    // I will stick to what was there or what's in DTO.
    // DTO has item_unit optional. I'll stick to previous modal for now to minimize changes, 
    // unless I see it used. Previous modal didn't have item_unit input? 
    // Previous modal: description, item_value, item_type.
    // DTO: item_unit is optional.
});

export type ItemFormData = z.infer<typeof itemSchema>;
