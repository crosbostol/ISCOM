export interface ItemDTO {
    item_id: number; // Serial ID
    description: string;
    item_value: number; // Unit Price
    item_type?: string;
    item_unit?: string;
}

export type CreateItemDTO = Omit<ItemDTO, 'item_id'>;
export type UpdateItemDTO = Partial<Omit<ItemDTO, 'item_id'>>;
