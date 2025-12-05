export interface ItemDTO {
    item_id: number;
    description: string;
    item_value: number;
    item_type: string;
    item_unit: string;
    [key: string]: any;
}
