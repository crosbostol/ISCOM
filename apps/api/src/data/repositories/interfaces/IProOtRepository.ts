import { ProOtDTO } from '../../dto/ProOtDTO';

export interface IProOtRepository {
    findByOtId(otId: number): Promise<ProOtDTO[]>;
    findByProductId(productId: number): Promise<ProOtDTO[]>;
    create(proOt: ProOtDTO): Promise<any>;
    delete(otId: number, productId: number): Promise<any>;
    update(otId: number, productId: number, quantity: number): Promise<any>;
}
