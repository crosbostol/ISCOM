import { ImageDTO } from '../../dto/ImageDTO';

export interface IImageRepository {
    findByOtId(ot_id: number): Promise<ImageDTO[]>;
    create(image: ImageDTO): Promise<any>;
    findById(image_id: number): Promise<ImageDTO | null>;
    delete(image_id: number): Promise<any>;
    update(image_id: number, url: string): Promise<any>;
}
