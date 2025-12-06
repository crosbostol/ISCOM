import { IOtRepository } from '../data/repositories/interfaces/IOtRepository';
import { OrdenTrabajoDTO } from '../data/dto/OrdenTrabajoDTO';

export class OtService {
    constructor(private otRepository: IOtRepository) { }

    async createOt(data: OrdenTrabajoDTO): Promise<any> {
        // Here we could add logic to check if external_ot_id is null, then set is_additional = true, etc.
        // Repository handles basic mapping.
        return this.otRepository.create(data);
    }

    async getAllOts(): Promise<OrdenTrabajoDTO[]> {
        return this.otRepository.findAll();
    }

    async getOtById(id: number): Promise<OrdenTrabajoDTO | null> {
        return this.otRepository.findById(id);
    }

    async updateOt(id: number, data: Partial<OrdenTrabajoDTO>): Promise<any> {
        return this.otRepository.update(id, data);
    }

    async rejectOt(id: number): Promise<any> {
        return this.otRepository.softDelete(id);
    }

    async getOtTable(): Promise<any[]> {
        return this.otRepository.getOtTable();
    }

    async getOtTableByState(state: string): Promise<any[]> {
        return this.otRepository.getOtTableByState(state);
    }

    async getFinishedOtsByRangeDate(start: string, end: string): Promise<OrdenTrabajoDTO[]> {
        return this.otRepository.findByRangeDate(start, end);
    }

    async getOtsByState(state: string): Promise<OrdenTrabajoDTO[]> {
        return this.otRepository.findByState(state);
    }

    async getRejectedOts(): Promise<OrdenTrabajoDTO[]> {
        return this.otRepository.findRejected();
    }
}
