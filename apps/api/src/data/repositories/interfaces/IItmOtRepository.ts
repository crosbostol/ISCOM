import { ItmOtDTO } from '../../dto/ItmOtDTO';

export interface IItmOtRepository {
    findAll(): Promise<ItmOtDTO[]>;
    findByOtId(otId: number): Promise<ItmOtDTO[]>;
    findByOtIdAndType(otId: number, type: string): Promise<ItmOtDTO[]>;
    create(itmOt: ItmOtDTO): Promise<any>;
    delete(itemId: number, otId: number): Promise<any>;
    update(itemId: number, otId: number, quantity: number): Promise<any>;
    createWithClient(itmOt: ItmOtDTO, client: any): Promise<any>;
    deleteAllByOtId(otId: number): Promise<void>;
}
