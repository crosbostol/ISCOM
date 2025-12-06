import { IProOtRepository } from '../data/repositories/interfaces/IProOtRepository';
import { ProOtDTO } from '../data/dto/ProOtDTO';

export class ProOtService {
    constructor(private proOtRepository: IProOtRepository) { }

    async getProOtByOt(otId: number): Promise<ProOtDTO[]> {
        return this.proOtRepository.findByOtId(otId);
    }

    async getProOtByProduct(productId: number): Promise<ProOtDTO[]> {
        return this.proOtRepository.findByProductId(productId);
    }

    async createProOt(proOt: ProOtDTO): Promise<any> {
        return this.proOtRepository.create(proOt);
    }

    async deleteProOt(otId: number, productId: number): Promise<any> {
        return this.proOtRepository.delete(otId, productId);
    }

    async updateProOt(otId: number, productId: number, quantity: number): Promise<any> {
        return this.proOtRepository.update(otId, productId, quantity);
    }
}
