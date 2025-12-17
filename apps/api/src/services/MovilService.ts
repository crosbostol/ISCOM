import { MovilRepository, CreateMovilDTO, UpdateMovilDTO } from '../data/repositories/MovilRepository';

export class MovilService {
    private repository: MovilRepository;

    constructor() {
        this.repository = new MovilRepository();
    }

    async getAll() {
        return this.repository.findAll();
    }

    async getById(id: string) {
        return this.repository.findById(id);
    }

    async create(data: CreateMovilDTO) {
        // Check if ID already exists
        const existing = await this.repository.findById(data.movil_id);
        if (existing) {
            throw new Error('DUPLICATE_ID');
        }
        return this.repository.create(data);
    }

    async update(id: string, data: UpdateMovilDTO) {
        return this.repository.update(id, data);
    }

    async delete(id: string) {
        return this.repository.delete(id);
    }
}
