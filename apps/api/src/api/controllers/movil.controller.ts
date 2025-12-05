import { Request, Response } from 'express';
import { MovilService } from '../../services/MovilService';
import { MovilRepository } from '../../data/repositories/MovilRepository';
import { MovilDTO } from '../../data/dto/MovilDTO';

const movilRepository = new MovilRepository();
const movilService = new MovilService(movilRepository);

export const getMovils = async (req: Request, res: Response) => {
    try {
        const result = await movilService.getAllMovils();
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const postMovil = async (req: Request, res: Response) => {
    try {
        const movil: MovilDTO = req.body;
        const result = await movilService.createMovil(movil);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const getMovilById = async (req: Request, res: Response) => {
    try {
        const movil_id = parseInt(req.params.movil_id);
        const result = await movilService.getMovilById(movil_id);
        res.status(201).send(result ? [result] : []);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const deleteMovilById = async (req: Request, res: Response) => {
    try {
        const movil_id = parseInt(req.params.movil_id);
        const result = await movilService.deleteMovil(movil_id);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const updateMovil = async (req: Request, res: Response) => {
    try {
        const movil_Id = parseInt(req.params.movil_Id);
        const movil: Partial<MovilDTO> = req.body;
        const result = await movilService.updateMovil(movil_Id, movil);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const getMovilOc = async (req: Request, res: Response) => {
    try {
        const result = await movilService.getMovilOc();
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};
