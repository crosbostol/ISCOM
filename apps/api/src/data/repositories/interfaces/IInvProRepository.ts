import { InvProDTO } from '../../dto/InvProDTO';

export interface IInvProRepository {
    findAll(): Promise<InvProDTO[]>;
    getTotalOfProduct(productId: number): Promise<any>;
    create(invPro: InvProDTO): Promise<any>;
    findById(productId: number, inventoryId: number): Promise<InvProDTO[]>;
    findByInventoryId(inventoryId: number): Promise<InvProDTO[]>;
    delete(productId: number, inventoryId: number): Promise<any>;
    update(productId: number, inventoryId: number, quantity: number): Promise<any>;
    getProductsNotInInventory(inventoryId: number): Promise<any[]>;
}
