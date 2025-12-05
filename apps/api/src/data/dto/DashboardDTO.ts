export interface MonthValueDTO {
    total_value: number;
}

export interface ItemTotalDTO {
    item_id: number;
    description: string;
    repetition_count: number;
    total_quantity: number;
}

export interface MonthlyYieldDTO {
    hydraulic_movil_id: number;
    item_count: number;
}
