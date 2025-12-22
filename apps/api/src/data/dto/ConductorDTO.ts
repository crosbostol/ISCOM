export interface ConductorDTO {
    id: number;
    name: string;
    rut: string;
}

export interface CreateConductorDTO {
    name: string;
    rut: string;
}

export interface UpdateConductorDTO {
    name?: string;
    rut?: string;
}
