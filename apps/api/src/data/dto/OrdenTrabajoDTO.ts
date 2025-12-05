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
 *         ot_id:
 *           type: string
 *           description: The auto-generated id of the OT
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
