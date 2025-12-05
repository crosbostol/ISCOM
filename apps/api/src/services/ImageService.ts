import { IImageRepository } from '../data/repositories/interfaces/IImageRepository';
import { ImageDTO } from '../data/dto/ImageDTO';

export class ImageService {
    constructor(private imageRepository: IImageRepository) { }

    async getImagesByOtId(ot_id: string): Promise<ImageDTO[]> {
        return this.imageRepository.findByOtId(ot_id);
    }

    async createImage(image: ImageDTO): Promise<any> {
        return this.imageRepository.create(image);
    }

    async getImageById(image_id: number): Promise<ImageDTO | null> {
        return this.imageRepository.findById(image_id);
    }

    async deleteImage(image_id: number): Promise<any> {
        return this.imageRepository.delete(image_id);
    }

    async updateImage(image_id: number, url: string): Promise<any> {
        return this.imageRepository.update(image_id, url);
    }
}
