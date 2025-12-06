export interface OT {
    id: number;
    external_ot_id: string | null;
    is_additional: boolean;
    ot_state: string;
    observation?: string;
    started_at?: string;
    finished_at?: string;
    street?: string;
    number_street?: number;
    commune?: string;
    hydraulic_movil_id?: string;
    civil_movil_id?: string;
    // Derived/Joined fields if available from backend list endpoint
    n_hidraulico?: string;
    n_civil?: string;
}
