import { InventoryDTO } from '../../dto/InventoryDTO';

export interface IInventoryRepository {
    create(inventory: InventoryDTO): Promise<any>;
    findAll(): Promise<any[]>; // Returns joined data
    getUnique(): Promise<InventoryDTO[]>;
    findById(id: number): Promise<any[]>; // Returns joined data
    delete(id: number): Promise<any>;
    update(id: number, inventory: InventoryDTO): Promise<any>;
}
