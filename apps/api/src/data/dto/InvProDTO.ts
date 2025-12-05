export interface InvProDTO {
    product_id: number;
    inventory_id: number;
    quantity: number;
    product_name?: string; // For joined queries
    [key: string]: any;
}
