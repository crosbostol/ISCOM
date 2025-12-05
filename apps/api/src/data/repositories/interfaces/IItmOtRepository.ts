import { ItmOtDTO } from '../../dto/ItmOtDTO';

export interface IItmOtRepository {
    findAll(): Promise<ItmOtDTO[]>;
    findByOtId(otId: string): Promise<ItmOtDTO[]>;
    create(itmOt: ItmOtDTO): Promise<any>;
    delete(itemId: number, otId: string): Promise<any>;
    update(itemId: number, otId: string, quantity: number): Promise<any>;
}
