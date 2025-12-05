import { IMovilRepository } from '../data/repositories/interfaces/IMovilRepository';
import { MovilDTO } from '../data/dto/MovilDTO';

export class MovilService {
    constructor(private movilRepository: IMovilRepository) { }

    async getAllMovils(): Promise<MovilDTO[]> {
        return this.movilRepository.findAll();
    }

    async getMovilById(id: number): Promise<MovilDTO | null> {
        return this.movilRepository.findById(id);
    }

    async createMovil(movil: MovilDTO): Promise<any> {
        return this.movilRepository.create(movil);
    }

    async deleteMovil(id: number): Promise<any> {
        return this.movilRepository.delete(id);
    }

    async updateMovil(id: number, movil: Partial<MovilDTO>): Promise<any> {
        return this.movilRepository.update(id, movil);
    }

    async getMovilOc(): Promise<any[]> {
        return this.movilRepository.getMovilOc();
    }
}
