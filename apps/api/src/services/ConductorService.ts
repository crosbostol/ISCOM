import { IConductorRepository } from '../data/repositories/interfaces/IConductorRepository';
import { ConductorDTO } from '../data/dto/ConductorDTO';

export class ConductorService {
    constructor(private conductorRepository: IConductorRepository) { }

    async getAllConductors(): Promise<ConductorDTO[]> {
        return this.conductorRepository.findAll();
    }

    async getConductorById(id: number): Promise<ConductorDTO | null> {
        return this.conductorRepository.findById(id);
    }

    async createConductor(conductor: ConductorDTO): Promise<any> {
        return this.conductorRepository.create(conductor);
    }

    async deleteConductor(id: number): Promise<any> {
        return this.conductorRepository.delete(id);
    }

    async updateConductor(id: number, conductor: Partial<ConductorDTO>): Promise<any> {
        return this.conductorRepository.update(id, conductor);
    }
}
