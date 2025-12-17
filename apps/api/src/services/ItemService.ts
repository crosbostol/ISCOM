import { ItemRepository } from '../data/repositories/ItemRepository';
import { CreateItemDTO, UpdateItemDTO } from '../data/dto/ItemDTO';

export class ItemService {
    private repository: ItemRepository;

    constructor() {
        this.repository = new ItemRepository();
    }

    async getAll() {
        return this.repository.findAll();
    }

    async getById(id: number) {
        return this.repository.findById(id);
    }

    async create(data: CreateItemDTO) {
        // No duplicate ID check needed (SERIAL)
        return this.repository.create(data);
    }

    async update(id: number, data: UpdateItemDTO) {
        return this.repository.update(id, data);
    }

    async delete(id: number) {
        return this.repository.delete(id);
    }
}
