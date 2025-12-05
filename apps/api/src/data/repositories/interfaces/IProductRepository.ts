import { ProductDTO } from '../../dto/ProductDTO';

export interface IProductRepository {
    findAll(): Promise<ProductDTO[]>;
    findById(id: number): Promise<ProductDTO | null>;
    create(product: ProductDTO): Promise<any>;
    update(id: number, product: Partial<ProductDTO>): Promise<any>;
    delete(id: number): Promise<any>;
}
