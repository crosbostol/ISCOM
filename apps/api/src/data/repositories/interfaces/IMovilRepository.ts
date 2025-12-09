import { MovilDTO } from '../../dto/MovilDTO';

export interface IMovilRepository {
    findAll(): Promise<MovilDTO[]>;
    findById(id: number): Promise<MovilDTO | null>;
    create(movil: MovilDTO): Promise<any>;
    delete(id: number): Promise<any>;
    update(id: number, movil: Partial<MovilDTO>): Promise<any>;
    getMovilOc(): Promise<any[]>;
    findByExternalCode(code: string): Promise<MovilDTO | null>;
}
