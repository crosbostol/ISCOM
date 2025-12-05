import { Request, Response } from 'express';
import { ProductService } from '../../services/ProductService';
import { ProductRepository } from '../../data/repositories/ProductRepository';
import { ProductDTO } from '../../data/dto/ProductDTO';

const productRepository = new ProductRepository();
const productService = new ProductService(productRepository);

export const getProducts = async (req: Request, res: Response) => {
    try {
        const result = await productService.getAllProducts();
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const postProduct = async (req: Request, res: Response) => {
    try {
        const product: ProductDTO = req.body;
        const result = await productService.createProduct(product);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const getProductById = async (req: Request, res: Response) => {
    try {
        const product_id = parseInt(req.params.product_id);
        const result = await productService.getProductById(product_id);
        res.status(201).send(result ? [result] : []);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const deleteProductById = async (req: Request, res: Response) => {
    try {
        const product_id = parseInt(req.params.product_id);
        const result = await productService.deleteProduct(product_id);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const product_Id = parseInt(req.params.product_Id);
        const product: Partial<ProductDTO> = req.body;
        const result = await productService.updateProduct(product_Id, product);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};
