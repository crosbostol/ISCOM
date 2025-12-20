
import { IOtRepository } from '../data/repositories/interfaces/IOtRepository';
import { IMovilRepository } from '../data/repositories/interfaces/IMovilRepository';
import { IItemRepository } from '../data/repositories/interfaces/IItemRepository';
import { IItmOtRepository } from '../data/repositories/interfaces/IItmOtRepository';
import { OrdenTrabajoDTO } from '../data/dto/OrdenTrabajoDTO';
import { OtFilter } from '../data/dto/OtFilter';


export class OtService {
    constructor(
        private otRepository: IOtRepository,
        private movilRepository: IMovilRepository,
        private itemRepository: IItemRepository,
        private itmOtRepository: IItmOtRepository
    ) { }

    private async calculateOtState(currentState: string | undefined, data: any): Promise<string> {
        if (currentState === 'PAGADA') return 'PAGADA';
        // If ANULADA, we might want to allow moving out of it? Or lock it? 
        // User didn't specify. Standard strict workflow locks Anulada too usually.
        // But user only mentioned PAGADA immutability. I'll stick to PAGADA for now.

        // Check for CLOSING_ITEM
        if (data.items && data.items.length > 0) {
            const allItems = await this.itemRepository.findAll();
            console.log('--- DEBUG calculateOtState ---');
            console.log('Incoming items:', data.items);
            if (allItems.length > 0) {
                console.log('Sample DB item:', allItems[0]);
                console.log('DB item_id type:', typeof allItems[0].item_id);
            } else {
                console.log('WARNING: Item repository returned empty list');
            }

            const hasClosingItem = data.items.some((i: any) => {
                const incomingId = Number(i.item_id);
                // Use Number() on both sides to be safe against string/number mismatch from DB driver
                const matchedItem = allItems.find(it => Number(it.item_id) === incomingId);

                console.log(`Checking item raw:${i.item_id} (Num:${incomingId}): matched?`, !!matchedItem, 'type:', matchedItem?.item_type);
                return matchedItem?.item_type === 'CLOSING_ITEM';
            });

            if (hasClosingItem) {
                console.log('Found CLOSING_ITEM -> POR_PAGAR');
                return 'POR_PAGAR';
            }
        }

        const h = !!data.hydraulic_movil_id;
        const c = !!data.civil_movil_id;
        const r = !!data.debris_movil_id;

        if (h && c && r) return 'POR_PAGAR';
        if (c && !r) return 'PENDIENTE_RET'; // Covers cases with Civil but no Debris (H or no H)
        if (h && !c && !r) return 'PENDIENTE_OC';

        return 'CREADA';
    }

    async create(data: any): Promise<any> {
        // --- Duplicate Logic Checks ---
        // 1. Check for duplicate Folio
        if (data.external_ot_id) {
            const existingFolio = await this.otRepository.findByExternalId(data.external_ot_id);
            if (existingFolio) {
                const error: any = new Error(`Ya existe una OT con el folio ${data.external_ot_id}.`);
                error.status = 409;
                throw error;
            }
        }

        // 2. Check for duplicate active address (Conditional: Only validation for "Adicionales" / No Folio)
        // If a Folio IS provided, we skip this check because the unique Folio (validated above) guarantees it's a distinct order,
        // allowing multiple OTs at the same address if they have different Folios.
        if (!data.external_ot_id && data.street && data.number_street && data.commune) {
            const existingOts = await this.otRepository.findByAddress(data.street, data.number_street, data.commune);
            const activeOt = existingOts.find(o => o.ot_state !== 'PAGADA' && o.ot_state !== 'ANULADA');
            if (activeOt) {
                const error: any = new Error(`Advertencia: Ya existe una OT ABIERTA (Adicional o con Folio) para la dirección ${data.street} ${data.number_street} (ID: ${activeOt.id}). Como no ingresó Folio, el sistema protege contra duplicados. Si es una OT distinta, ingrese su Folio.`);
                error.status = 409;
                throw error;
            }
        }

        // --- Date Logic ---
        data.ot_state = await this.calculateOtState(undefined, data);

        if (data.hydraulic_movil_id && !data.started_at) {
            data.started_at = new Date();
        }
        if (data.civil_movil_id && !data.civil_work_at) {
            data.civil_work_at = new Date();
        }
        // Logic: Debris Date Mapping
        if (data.debris_date) {
            data.finished_at = data.debris_date;
            delete data.debris_date;
        } else if (data.debris_movil_id && !data.finished_at) {
            data.finished_at = new Date();
        }

        const ot = await this.otRepository.create(data);

        // --- Items Logic ---
        if (data.items && data.items.length > 0) {
            for (const item of data.items) {
                await this.itmOtRepository.create({
                    ot_id: ot.id,
                    item_id: item.item_id,
                    quantity: item.quantity,
                    is_additional: false,
                    assigned_movil_id: item.assigned_movil_id
                });
            }
        }
        return ot;
    }

    async update(id: number, data: any): Promise<any> {
        // Fetch current to check for PAGADA immutability
        const currentOt = await this.otRepository.findById(id);
        if (currentOt) {
            data.ot_state = await this.calculateOtState(currentOt.ot_state, data);
        }

        // --- Date Logic Upsert ---
        // Only set if not already present, or override if needed. 
        // Strategy: If new resource is assigned, set timestamp if not passed.
        if (data.hydraulic_movil_id && !data.started_at) {
            data.started_at = new Date();
        }
        if (data.civil_movil_id && !data.civil_work_at) {
            data.civil_work_at = new Date();
        }
        // Logic: Debris Date Mapping
        if (data.debris_date) {
            data.finished_at = data.debris_date;
            delete data.debris_date;
        } else if (data.debris_movil_id && !data.finished_at) {
            data.finished_at = new Date();
        }

        const ot = await this.otRepository.update(id, data);

        // --- Items Update Logic (Simplified: Add new ones, or potential replace?) ---
        // For this iteration, we just ADD items if passed. 
        // Ideally we might clear old items for this OT if replacing, but let's stick to simple adding for now 
        // or check requirement. "ensure assignment matches items". 
        // We'll append.
        // --- Items Update Logic (Sync by Replace) ---
        if (data.items) {
            await this.itmOtRepository.deleteAllByOtId(id);

            if (data.items.length > 0) {
                for (const item of data.items) {
                    await this.itmOtRepository.create({
                        ot_id: id,
                        item_id: item.item_id,
                        quantity: item.quantity,
                        is_additional: false,
                        assigned_movil_id: item.assigned_movil_id
                    });
                }
            }
        }

        return ot;
    }

    async findById(id: number): Promise<any> {
        return this.otRepository.findById(id);
    }

    async getOtTable(limit?: number, offset?: number, filters?: OtFilter): Promise<any[]> {
        return this.otRepository.getOtTable(limit, offset, filters);
    }

    async getGranularReportData(filters: OtFilter): Promise<any[]> {
        return this.otRepository.getReportData(filters);
    }

    async getMovils(): Promise<any[]> {
        return this.movilRepository.findAll();
    }

    async getItems(): Promise<any[]> {
        return this.itemRepository.findAll();
    }
}
