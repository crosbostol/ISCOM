import { Request, Response } from 'express';
import { ProOtService } from '../../services/ProOtService';
import { ProOtRepository } from '../../data/repositories/ProOtRepository';
import { ProOtDTO } from '../../data/dto/ProOtDTO';

const proOtRepository = new ProOtRepository();
const proOtService = new ProOtService(proOtRepository);

export const getProOtbyOt = async (req: Request, res: Response) => {
    try {
        const { ot_id } = req.params;
        const result = await proOtService.getProOtByOt(ot_id);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const getProOtbyProduct = async (req: Request, res: Response) => {
    try {
        const product_id = parseInt(req.params.product_id);
        const result = await proOtService.getProOtByProduct(product_id);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const deleteProOt = async (req: Request, res: Response) => {
    try {
        const { ot_id } = req.params;
        const product_id = parseInt(req.params.product_id);
        const result = await proOtService.deleteProOt(ot_id, product_id);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const postProOt = async (req: Request, res: Response) => {
    try {
        const proOt: ProOtDTO = req.body;
        const result = await proOtService.createProOt(proOt);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const updateProOt = async (req: Request, res: Response) => {
    try {
        const { ot_id } = req.params;
        const product_id = parseInt(req.params.product_id);
        const { quantity } = req.body;
        const result = await proOtService.updateProOt(ot_id, product_id, quantity);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};
