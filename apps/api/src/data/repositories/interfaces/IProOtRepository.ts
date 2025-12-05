import { ProOtDTO } from '../../dto/ProOtDTO';

export interface IProOtRepository {
    findByOtId(otId: string): Promise<ProOtDTO[]>;
    findByProductId(productId: number): Promise<ProOtDTO[]>;
    create(proOt: ProOtDTO): Promise<any>;
    delete(otId: string, productId: number): Promise<any>;
    update(otId: string, productId: number, quantity: number): Promise<any>;
}
