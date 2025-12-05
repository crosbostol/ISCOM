import { Request, Response } from 'express';
import { InvProService } from '../../services/InvProService';
import { InvProRepository } from '../../data/repositories/InvProRepository';
import { InvProDTO } from '../../data/dto/InvProDTO';

const invProRepository = new InvProRepository();
const invProService = new InvProService(invProRepository);

export const getInvPro = async (req: Request, res: Response) => {
    try {
        const result = await invProService.getAllInvPro();
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const getTotalOfProduct = async (req: Request, res: Response) => {
    try {
        const product_id = parseInt(req.params.product_id);
        const result = await invProService.getTotalOfProduct(product_id);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const postInvPro = async (req: Request, res: Response) => {
    try {
        const invPro: InvProDTO = req.body;
        const result = await invProService.createInvPro(invPro);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const getInvProById = async (req: Request, res: Response) => {
    try {
        const product_id = parseInt(req.params.product_id);
        const inventory_id = parseInt(req.params.inventory_id);
        const result = await invProService.getInvProById(product_id, inventory_id);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const getInvProByInventoryId = async (req: Request, res: Response) => {
    try {
        const inventory_id = parseInt(req.params.inventory_id);
        const result = await invProService.getInvProByInventoryId(inventory_id);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const deleteInvProById = async (req: Request, res: Response) => {
    try {
        const product_id = parseInt(req.params.product_id);
        const inventory_id = parseInt(req.params.inventory_id);
        const result = await invProService.deleteInvPro(product_id, inventory_id);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const updateInvPro = async (req: Request, res: Response) => {
    try {
        const product_Id = parseInt(req.params.product_Id);
        const inventory_Id = parseInt(req.params.inventory_Id);
        const { quantity } = req.body;
        const result = await invProService.updateInvPro(product_Id, inventory_Id, quantity);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const getProductsNotInInventory = async (req: Request, res: Response) => {
    try {
        const inventory_id = parseInt(req.params.inventory_id);
        const result = await invProService.getProductsNotInInventory(inventory_id);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};
