export interface ItmOtDTO {
    item_id: number;
    ot_id: string;
    quantity: number;
    item_Total?: number; // Calculated field
    [key: string]: any;
}
