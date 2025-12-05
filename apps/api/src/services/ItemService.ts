import { IItemRepository } from '../data/repositories/interfaces/IItemRepository';
import { ItemDTO } from '../data/dto/ItemDTO';

export class ItemService {
    constructor(private itemRepository: IItemRepository) { }

    async getAllItems(): Promise<ItemDTO[]> {
        return this.itemRepository.findAll();
    }

    async getItemsByType(type: string): Promise<ItemDTO[]> {
        return this.itemRepository.findByType(type);
    }

    async getItemById(id: number): Promise<ItemDTO | null> {
        return this.itemRepository.findById(id);
    }

    async createItem(item: ItemDTO): Promise<any> {
        return this.itemRepository.create(item);
    }

    async updateItem(id: number, item: Partial<ItemDTO>): Promise<any> {
        return this.itemRepository.update(id, item);
    }

    async deleteItem(id: number): Promise<any> {
        return this.itemRepository.delete(id);
    }
}
