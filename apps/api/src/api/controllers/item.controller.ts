import { Request, Response } from 'express';
import { ItemService } from '../../services/ItemService';
import { ItemRepository } from '../../data/repositories/ItemRepository';
import { ItemDTO } from '../../data/dto/ItemDTO';

const itemRepository = new ItemRepository();
const itemService = new ItemService(itemRepository);

export const getItem = async (req: Request, res: Response) => {
    try {
        const result = await itemService.getAllItems();
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const getItemOH = async (req: Request, res: Response) => {
    try {
        const result = await itemService.getItemsByType('AGUA POTABLE');
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const getItemOC = async (req: Request, res: Response) => {
    try {
        const result = await itemService.getItemsByType('OBRAS');
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const postItem = async (req: Request, res: Response) => {
    try {
        const item: ItemDTO = req.body;
        const result = await itemService.createItem(item);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const getItemById = async (req: Request, res: Response) => {
    try {
        const item_id = parseInt(req.params.item_id);
        const result = await itemService.getItemById(item_id);
        res.status(201).send(result ? [result] : []); // Legacy returns array
    } catch (error) {
        res.status(500).send(error);
    }
};

export const deleteItemById = async (req: Request, res: Response) => {
    try {
        const item_id = parseInt(req.params.item_id);
        const result = await itemService.deleteItem(item_id);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const updateItem = async (req: Request, res: Response) => {
    try {
        const item_Id = parseInt(req.params.item_Id);
        const item: Partial<ItemDTO> = req.body;
        const result = await itemService.updateItem(item_Id, item);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};
