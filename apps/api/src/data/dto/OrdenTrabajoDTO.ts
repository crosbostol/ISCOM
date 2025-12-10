
/**
 * @swagger
 * components:
 *   schemas:
 *     OrdenTrabajoDTO:
 *       type: object
 *       required:
 *         - street
 *         - number_street
 *         - commune
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the OT (Internal PK)
 *         external_ot_id:
 *           type: string
 *           nullable: true
 *           description: The client verification ID (Old PK). Null for additional OTs.
 *         is_additional:
 *           type: boolean
 *           default: false
 *           description: Flag for additional OTs
 *         street:
 *           type: string
 *           description: Street name
 *         number_street:
 *           type: string
 *           description: Street number
 *         commune:
 *           type: string
 *           description: Commune name
 *         fuga_location:
 *           type: string
 *           description: Location of the leak
 *         started_at:
 *           type: string
 *           format: date-time
 *           description: Start date
 *         finished_at:
 *           type: string
 *           format: date-time
 *           description: Finish date
 *         hydraulic_movil_id:
 *           type: integer
 *           description: ID of the hydraulic movil
 *         civil_movil_id:
 *           type: integer
 *           description: ID of the civil movil
 *         ot_state:
 *           type: string
 *           description: State of the OT
 *         dismissed:
 *           type: boolean
 *           description: Soft delete flag
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
