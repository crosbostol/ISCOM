import { ItemDTO } from '../../dto/ItemDTO';

export interface IItemRepository {
    findAll(): Promise<ItemDTO[]>;
    findByType(type: string): Promise<ItemDTO[]>;
    findById(id: number): Promise<ItemDTO | null>;
    create(item: ItemDTO): Promise<any>;
    update(id: number, item: Partial<ItemDTO>): Promise<any>;
    delete(id: number): Promise<any>;
    findIdByDescription(description: string): Promise<number | null>;
}
