import { IInvProRepository } from '../data/repositories/interfaces/IInvProRepository';
import { InvProDTO } from '../data/dto/InvProDTO';

export class InvProService {
    constructor(private invProRepository: IInvProRepository) { }

    async getAllInvPro(): Promise<InvProDTO[]> {
        return this.invProRepository.findAll();
    }

    async getTotalOfProduct(productId: number): Promise<any> {
        return this.invProRepository.getTotalOfProduct(productId);
    }

    async createInvPro(invPro: InvProDTO): Promise<any> {
        return this.invProRepository.create(invPro);
    }

    async getInvProById(productId: number, inventoryId: number): Promise<InvProDTO[]> {
        return this.invProRepository.findById(productId, inventoryId);
    }

    async getInvProByInventoryId(inventoryId: number): Promise<InvProDTO[]> {
        return this.invProRepository.findByInventoryId(inventoryId);
    }

    async deleteInvPro(productId: number, inventoryId: number): Promise<any> {
        return this.invProRepository.delete(productId, inventoryId);
    }

    async updateInvPro(productId: number, inventoryId: number, quantity: number): Promise<any> {
        return this.invProRepository.update(productId, inventoryId, quantity);
    }

    async getProductsNotInInventory(inventoryId: number): Promise<any[]> {
        return this.invProRepository.getProductsNotInInventory(inventoryId);
    }
}
