export interface ConductorDTO {
    conductor_id: number;
    movil_id: number;
    name?: string; // Inferred from joined query in legacy code
    [key: string]: any;
}
