import { OrdenTrabajoDTO } from '../../dto/OrdenTrabajoDTO';
import { OtFilter } from '../../dto/OtFilter';

export interface IOtRepository {
    create(ot: OrdenTrabajoDTO): Promise<any>;
    findAll(): Promise<OrdenTrabajoDTO[]>;
    findById(id: number): Promise<OrdenTrabajoDTO | null>;
    findByExternalId(external_id: string): Promise<OrdenTrabajoDTO | null>;
    findByAddress(street: string, number: string, commune: string): Promise<OrdenTrabajoDTO[]>;
    update(id: number, ot: Partial<OrdenTrabajoDTO>): Promise<any>;
    softDelete(id: number): Promise<any>;
    getOtTable(limit?: number, offset?: number, filters?: OtFilter): Promise<any[]>;
    getReportData(filters: OtFilter): Promise<any[]>;
    getOtTableByState(state: string): Promise<any[]>;
    findByRangeDate(start: string, end: string): Promise<OrdenTrabajoDTO[]>;
    findByState(state: string): Promise<OrdenTrabajoDTO[]>;
    findRejected(): Promise<OrdenTrabajoDTO[]>;
    createWithClient(ot: OrdenTrabajoDTO, client: any): Promise<any>;
    updateWithClient(id: number, ot: Partial<OrdenTrabajoDTO>, client: any): Promise<any>;
    updateMovil(id: number, hydraulicId: string | null, civilId: string | null, client: any): Promise<void>;
    updateMovilAndDates(id: number, hydraulicId: string | null, civilId: string | null, startedAt: Date | undefined, civilDate: Date | undefined, client: any): Promise<void>;
}
