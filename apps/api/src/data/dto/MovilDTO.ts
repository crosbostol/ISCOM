export interface MovilDTO {
    movil_id: string;        // ID / Patente
    external_code?: string;  // Codigo Externo
    inventory_id?: string;   // Same as movil_id usually
    movil_observations?: string;
    movil_type: string;
    movil_state?: string;
    [key: string]: any;
}
