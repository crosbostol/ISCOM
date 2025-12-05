import { OrdenTrabajoDTO } from '../../dto/OrdenTrabajoDTO';

export interface IOtRepository {
    create(ot: OrdenTrabajoDTO): Promise<any>;
    findAll(): Promise<OrdenTrabajoDTO[]>;
    findById(id: string): Promise<OrdenTrabajoDTO | null>;
    update(id: string, ot: Partial<OrdenTrabajoDTO>): Promise<any>;
    softDelete(id: string): Promise<any>;
}
