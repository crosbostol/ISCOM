import { ItemDTO, CreateItemDTO, UpdateItemDTO } from '../../dto/ItemDTO';

export interface IItemRepository {
    findAll(): Promise<ItemDTO[]>;
    findById(id: number): Promise<ItemDTO | null>;
    create(data: CreateItemDTO): Promise<ItemDTO>;
    update(id: number, data: UpdateItemDTO): Promise<ItemDTO | null>;
    delete(id: number): Promise<boolean>;
    findIdByDescription(description: string): Promise<number | null>;
}
