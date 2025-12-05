import { IInventoryRepository } from '../data/repositories/interfaces/IInventoryRepository';
import { InventoryDTO } from '../data/dto/InventoryDTO';

export class InventoryService {
    constructor(private inventoryRepository: IInventoryRepository) { }

    async createInventory(inventory: InventoryDTO): Promise<any> {
        return this.inventoryRepository.create(inventory);
    }

    async getAllInventories(): Promise<any[]> {
        return this.inventoryRepository.findAll();
    }

    async getUniqueInventories(): Promise<InventoryDTO[]> {
        return this.inventoryRepository.getUnique();
    }

    async getInventoryById(id: number): Promise<any[]> {
        return this.inventoryRepository.findById(id);
    }

    async deleteInventory(id: number): Promise<any> {
        return this.inventoryRepository.delete(id);
    }

    async updateInventory(id: number, inventory: InventoryDTO): Promise<any> {
        return this.inventoryRepository.update(id, inventory);
    }
}
