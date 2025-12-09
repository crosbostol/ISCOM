import { OrdenTrabajoDTO } from '../../dto/OrdenTrabajoDTO';

export interface IOtRepository {
    create(ot: OrdenTrabajoDTO): Promise<any>;
    findAll(): Promise<OrdenTrabajoDTO[]>;
    findById(id: number): Promise<OrdenTrabajoDTO | null>;
    findByExternalId(external_id: string): Promise<OrdenTrabajoDTO | null>;
    update(id: number, ot: Partial<OrdenTrabajoDTO>): Promise<any>;
    softDelete(id: number): Promise<any>;
    getOtTable(): Promise<any[]>;
    getOtTableByState(state: string): Promise<any[]>;
    findByRangeDate(start: string, end: string): Promise<OrdenTrabajoDTO[]>;
    findByState(state: string): Promise<OrdenTrabajoDTO[]>;
    findRejected(): Promise<OrdenTrabajoDTO[]>;
    createWithClient(ot: OrdenTrabajoDTO, client: any): Promise<any>;
}
