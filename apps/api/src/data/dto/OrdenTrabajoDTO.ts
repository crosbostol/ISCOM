
/**
 * @swagger
 * components:
 *   schemas:
 *     OrdenTrabajoDTO:
 *       properties:
 *         civil_movil_id:
 *           description: ID of the civil movil
 *           type: integer
 *         commune:
 *           description: Commune name
 *           type: string
 *         dismissed:
 *           description: Soft delete flag
 *           type: boolean
 *         external_ot_id:
 *           description: The client verification ID (Old PK). Null for additional OTs.
 *           nullable: true
 *           type: string
 *         finished_at:
 *           description: Finish date
 *           format: date-time
 *           type: string
 *         fuga_location:
 *           description: Location of the leak
 *           type: string
 *         hydraulic_movil_id:
 *           description: ID of the hydraulic movil
 *           type: integer
 *         id:
 *           description: The auto-generated id of the OT (Internal PK)
 *           type: integer
 *         is_additional:
 *           default: false
 *           description: Flag for additional OTs
 *           type: boolean
 *         number_street:
 *           description: Street number
 *           type: string
 *         ot_state:
 *           description: State of the OT
 *           type: string
 *         started_at:
 *           description: Start date
 *           format: date-time
 *           type: string
 *         street:
 *           description: Street name
 *           type: string
 *       required:
 *         - street
 *         - number_street
 *         - commune
 *       type: object
 */
export interface OrdenTrabajoDTO {
    id?: number;
    external_ot_id?: string | null;
    is_additional?: boolean;
    street?: string;
    number_street?: string;
    commune?: string;
    fuga_location?: string;
    started_at?: Date;
    finished_at?: Date;
    hydraulic_movil_id?: string | null;
    civil_movil_id?: string | null;
    ot_state?: string;
    dismissed?: boolean;
    [key: string]: any; // Allow other fields for flexibility during migration
}
