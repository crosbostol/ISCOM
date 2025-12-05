import { OrdenTrabajoDTO } from '../../dto/OrdenTrabajoDTO';

export interface IOtRepository {
    create(ot: OrdenTrabajoDTO): Promise<any>;
    findAll(): Promise<OrdenTrabajoDTO[]>;
    findById(id: string): Promise<OrdenTrabajoDTO | null>;
    update(id: string, ot: Partial<OrdenTrabajoDTO>): Promise<any>;
    softDelete(id: string): Promise<any>;
    getOtTable(): Promise<any[]>;
    getOtTableByState(state: string): Promise<any[]>;
    findByRangeDate(start: string, end: string): Promise<OrdenTrabajoDTO[]>;
    findByState(state: string): Promise<OrdenTrabajoDTO[]>;
    findRejected(): Promise<OrdenTrabajoDTO[]>;
}
