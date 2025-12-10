export interface ItmOtDTO {
    id?: number;
    item_id: string;
    ot_id: number;
    quantity: number;
    item_Total?: number; // Calculated field
    created_at?: Date;
    [key: string]: any;
}
