import { Request, Response } from 'express';
import { ImageService } from '../../services/ImageService';
import { ImageRepository } from '../../data/repositories/ImageRepository';
import { ImageDTO } from '../../data/dto/ImageDTO';

// Manual Dependency Injection
const imageRepository = new ImageRepository();
const imageService = new ImageService(imageRepository);

export const getImagebyOt = async (req: Request, res: Response) => {
    try {
        const { ot_id } = req.params;
        const id = parseInt(ot_id);
        const result = await imageService.getImagesByOtId(id);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const postImage = async (req: Request, res: Response) => {
    try {
        const image: ImageDTO = req.body;
        const result = await imageService.createImage(image);
        res.status(201).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const getImageById = async (req: Request, res: Response) => {
    try {
        const image_id = parseInt(req.params.image_id);
        const result = await imageService.getImageById(image_id);
        if (!result) {
            return res.status(404).send({ message: 'Image not found' });
        }
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const deleteImageById = async (req: Request, res: Response) => {
    try {
        const image_id = parseInt(req.params.image_id);
        const result = await imageService.deleteImage(image_id);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};

export const updateImage = async (req: Request, res: Response) => {
    try {
        const image_id = parseInt(req.params.image_id);
        const { url } = req.body;
        const result = await imageService.updateImage(image_id, url);
        res.status(200).send(result);
    } catch (error) {
        res.status(500).send(error);
    }
};
