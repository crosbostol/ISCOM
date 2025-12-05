export interface ProductDTO {
    product_id?: number;
    product_name: string;
    product_category: string;
    product_unit: string;
    [key: string]: any;
}
