import { Request, Response } from 'express';
import { ConductorService } from '../../services/ConductorService';
import { ConductorRepository } from '../../data/repositories/ConductorRepository';
import { ConductorDTO } from '../../data/dto/ConductorDTO';

const conductorRepository = new ConductorRepository();
const conductorService = new ConductorService(conductorRepository);

export const getConductors = async (req: Request, res: Response) => {
    try {
        const result = await conductorService.getAllConductors();
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const postConductors = async (req: Request, res: Response) => {
    try {
        const conductor: ConductorDTO = req.body;
        const result = await conductorService.createConductor(conductor);
        res.json({
            message: `Conductor ${conductor.conductor_id} creado correctamente`,
            body: {
                user: { conductor_id: conductor.conductor_id, movil_id: conductor.movil_id }
            }
        });
    } catch (error) {
        res.status(500).send(error);
    }
};

export const getConductorById = async (req: Request, res: Response) => {
    try {
        const conductor_id = parseInt(req.params.conductor_id);
        const result = await conductorService.getConductorById(conductor_id);
        res.status(201).send(result ? [result] : []);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const deleteConductorById = async (req: Request, res: Response) => {
    try {
        const conductor_id = parseInt(req.params.conductor_id);
        const result = await conductorService.deleteConductor(conductor_id);
        res.json({
            message: `Conductor ${conductor_id} eliminado correctamente`,
            body: {
                user: { conductor_id: conductor_id, movil_id: req.params.movil_id } // Legacy logic
            }
        });
    } catch (error) {
        res.status(500).send(error);
    }
};

export const updateConductor = async (req: Request, res: Response) => {
    try {
        const conductor_id = parseInt(req.params.conductor_id);
        const conductor: Partial<ConductorDTO> = req.body;
        const result = await conductorService.updateConductor(conductor_id, conductor);
        res.status(200).json({
            message: `Conductor ${conductor_id} actualizado correctamente`,
            body: {
                user: { conductor_id: conductor.conductor_id, movil_id: conductor.movil_id }
            }
        });
    } catch (error) {
        res.status(500).send(error);
    }
};
