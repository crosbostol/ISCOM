export interface ItmOtDTO {
    item_id: number;
    ot_id: number;
    quantity: number;
    item_Total?: number; // Calculated field
    [key: string]: any;
}
