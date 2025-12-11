import { Request, Response } from 'express';
import { OtService } from '../../services/OtService';
import { OtRepository } from '../../data/repositories/OtRepository';

import { MovilRepository } from '../../data/repositories/MovilRepository';
import { ItemRepository } from '../../data/repositories/ItemRepository';
import { ItmOtRepository } from '../../data/repositories/ItmOtRepository';

import { ImportService } from '../../services/ImportService';

// Manual Dependency Injection
const otRepository = new OtRepository();
const movilRepository = new MovilRepository();
const itemRepository = new ItemRepository();
const itmOtRepository = new ItmOtRepository();

const otService = new OtService(otRepository, movilRepository, itemRepository, itmOtRepository);
const importService = new ImportService(otRepository, movilRepository, itemRepository, itmOtRepository);

/**
 * @swagger
 * tags:
 *   description: The OT managing API
 *   name: OTs
 */

export const uploadOtCsv = async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).send({ message: 'No file uploaded' });
        }
        const result = await importService.processCsv(req.file.path);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const getOtTable = async (req: Request, res: Response) => {
    try {
        const result = await otService.getOtTable();
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};
