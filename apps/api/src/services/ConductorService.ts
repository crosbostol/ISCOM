import { ConductorRepository, CreateConductorDTO, UpdateConductorDTO } from '../data/repositories/ConductorRepository';

export class ConductorService {
    private repository: ConductorRepository;

    constructor() {
        this.repository = new ConductorRepository();
    }

    async getAll() {
        return this.repository.findAll();
    }

    async getById(id: number) {
        return this.repository.findById(id);
    }

    async create(data: CreateConductorDTO) {
        // Validation: Unique RUT
        const existing = await this.repository.findByRut(data.rut);
        if (existing) {
            throw new Error('DUPLICATE_RUT');
        }
        return this.repository.create(data);
    }

    async update(id: number, data: UpdateConductorDTO) {
        if (data.rut) {
            const existing = await this.repository.findByRut(data.rut);
            // Ensure it's not another user's RUT
            if (existing && existing.id !== id) {
                throw new Error('DUPLICATE_RUT');
            }
        }
        return this.repository.update(id, data);
    }

    async delete(id: number) {
        return this.repository.delete(id);
    }
}
