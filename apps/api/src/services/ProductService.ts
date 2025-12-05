import { IProductRepository } from '../data/repositories/interfaces/IProductRepository';
import { ProductDTO } from '../data/dto/ProductDTO';

export class ProductService {
    constructor(private productRepository: IProductRepository) { }

    async getAllProducts(): Promise<ProductDTO[]> {
        return this.productRepository.findAll();
    }

    async getProductById(id: number): Promise<ProductDTO | null> {
        return this.productRepository.findById(id);
    }

    async createProduct(product: ProductDTO): Promise<any> {
        return this.productRepository.create(product);
    }

    async updateProduct(id: number, product: Partial<ProductDTO>): Promise<any> {
        return this.productRepository.update(id, product);
    }

    async deleteProduct(id: number): Promise<any> {
        return this.productRepository.delete(id);
    }
}
