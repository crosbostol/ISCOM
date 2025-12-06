import { IItmOtRepository } from '../data/repositories/interfaces/IItmOtRepository';
import { ItmOtDTO } from '../data/dto/ItmOtDTO';

export class ItmOtService {
    constructor(private itmOtRepository: IItmOtRepository) { }

    async getAllItmOt(): Promise<ItmOtDTO[]> {
        return this.itmOtRepository.findAll();
    }

    async getItmByOt(otId: number): Promise<ItmOtDTO[]> {
        return this.itmOtRepository.findByOtId(otId);
    }

    async getItmByOtAndType(otId: number, type: string): Promise<ItmOtDTO[]> {
        return this.itmOtRepository.findByOtIdAndType(otId, type);
    }

    async createItmOt(itmOt: ItmOtDTO): Promise<any> {
        return this.itmOtRepository.create(itmOt);
    }

    async deleteItmOt(itemId: number, otId: number): Promise<any> {
        return this.itmOtRepository.delete(itemId, otId);
    }

    async updateItmOt(itemId: number, otId: number, quantity: number): Promise<any> {
        return this.itmOtRepository.update(itemId, otId, quantity);
    }
}
