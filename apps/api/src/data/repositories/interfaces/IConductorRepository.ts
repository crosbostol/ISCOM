import { ConductorDTO } from '../../dto/ConductorDTO';

export interface IConductorRepository {
    findAll(): Promise<ConductorDTO[]>;
    findById(id: number): Promise<ConductorDTO | null>;
    create(conductor: ConductorDTO): Promise<any>;
    delete(id: number): Promise<any>;
    update(id: number, conductor: Partial<ConductorDTO>): Promise<any>;
}
