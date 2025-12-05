import { Request, Response } from 'express';
import { ItmOtService } from '../../services/ItmOtService';
import { ItmOtRepository } from '../../data/repositories/ItmOtRepository';
import { ItmOtDTO } from '../../data/dto/ItmOtDTO';

const itmOtRepository = new ItmOtRepository();
const itmOtService = new ItmOtService(itmOtRepository);

export const getItmOt = async (req: Request, res: Response) => {
    try {
        const result = await itmOtService.getAllItmOt();
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const getItmByOt = async (req: Request, res: Response) => {
    try {
        const { ot_id } = req.params;
        const result = await itmOtService.getItmByOt(ot_id);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const postItmOt = async (req: Request, res: Response) => {
    try {
        const itmOt: ItmOtDTO = req.body;
        const result = await itmOtService.createItmOt(itmOt);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const deleteItmOtById = async (req: Request, res: Response) => {
    try {
        const item_id = parseInt(req.params.item_id);
        const { ot_id } = req.params;
        const result = await itmOtService.deleteItmOt(item_id, ot_id);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const updateItmOt = async (req: Request, res: Response) => {
    try {
        const item_Id = parseInt(req.params.item_Id);
        const { ot_Id } = req.params;
        const { quantity } = req.body;
        const result = await itmOtService.updateItmOt(item_Id, ot_Id, quantity);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const getDetailsOtItem = async (req: Request, res: Response) => {
    try {
        const { ot_id, item_type } = req.params;
        const result = await itmOtService.getItmByOtAndType(ot_id, item_type);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};
