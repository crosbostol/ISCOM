export interface OrdenTrabajoDTO {
    ot_id?: string;
    street?: string;
    number_street?: string;
    commune?: string;
    fuga_location?: string;
    started_at?: Date;
    finished_at?: Date;
    hydraulic_movil_id?: number;
    civil_movil_id?: number;
    ot_state?: string;
    dismissed?: boolean;
    [key: string]: any; // Allow other fields for flexibility during migration
}
