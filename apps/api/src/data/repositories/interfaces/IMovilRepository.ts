import { MovilDTO } from '../../dto/MovilDTO';

export interface IMovilRepository {
    findAll(): Promise<MovilDTO[]>;
    findById(id: string): Promise<MovilDTO | null>;
    create(movil: MovilDTO): Promise<any>;
    delete(id: string): Promise<any>;
    update(id: string, movil: Partial<MovilDTO>): Promise<any>;
    getMovilOc(): Promise<any[]>;
    findByExternalCode(code: string): Promise<MovilDTO | null>;
}
