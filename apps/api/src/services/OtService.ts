import { IOtRepository } from '../data/repositories/interfaces/IOtRepository';
import { OrdenTrabajoDTO } from '../data/dto/OrdenTrabajoDTO';

export class OtService {
    constructor(private otRepository: IOtRepository) { }

    async createOt(data: OrdenTrabajoDTO): Promise<any> {
        // Future business logic/validation goes here
        return this.otRepository.create(data);
    }

    async getAllOts(): Promise<OrdenTrabajoDTO[]> {
        return this.otRepository.findAll();
    }

    async getOtById(id: string): Promise<OrdenTrabajoDTO | null> {
        return this.otRepository.findById(id);
    }

    async updateOt(id: string, data: Partial<OrdenTrabajoDTO>): Promise<any> {
        return this.otRepository.update(id, data);
    }

    async rejectOt(id: string): Promise<any> {
        return this.otRepository.softDelete(id);
    }
}
