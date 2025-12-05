import { Request, Response } from 'express';
import { InventoryService } from '../../services/InventoryService';
import { InventoryRepository } from '../../data/repositories/InventoryRepository';
import { InventoryDTO } from '../../data/dto/InventoryDTO';

const inventoryRepository = new InventoryRepository();
const inventoryService = new InventoryService(inventoryRepository);

export const postInventory = async (req: Request, res: Response) => {
    try {
        const inventory: InventoryDTO = req.body;
        const result = await inventoryService.createInventory(inventory);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const getUniqueInventories = async (req: Request, res: Response) => {
    try {
        const result = await inventoryService.getUniqueInventories();
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const getInventory = async (req: Request, res: Response) => {
    try {
        const result = await inventoryService.getAllInventories();
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const getInventoryById = async (req: Request, res: Response) => {
    try {
        const inventory_id = parseInt(req.params.inventory_id);
        const result = await inventoryService.getInventoryById(inventory_id);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const deleteInventory = async (req: Request, res: Response) => {
    try {
        const inventory_id = parseInt(req.params.inventory_id);
        const result = await inventoryService.deleteInventory(inventory_id);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const putInventory = async (req: Request, res: Response) => {
    try {
        const inventory_id = parseInt(req.params.inventory_id);
        const inventory: InventoryDTO = req.body;
        const result = await inventoryService.updateInventory(inventory_id, inventory);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};
