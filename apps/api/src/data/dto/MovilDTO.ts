export interface MovilDTO {
    movil_id: number;
    inventory_id?: number;
    movil_observations?: string;
    movil_type: string;
    movil_state?: string;
    [key: string]: any;
}
