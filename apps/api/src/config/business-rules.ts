export const DEBRIS_RULES = {

    // Whitelist: Únicos ítems permitidos para guardar en estos móviles
    allowedItems: [
        'BASE ESTABILIZADA', // El requerimiento crítico
    ]
} as const;

export const MOVIL_PATTERNS = {
    HYDRAULIC: ['MOV_HID', 'MOV_APO'], // Prefijo para móviles Hidráulicos -> started_at
    CIVIL: 'OC',          // Contenido para móviles Obras Civiles -> civil_work_at
    CIVIL_ALT: 'MOV_OC',  // Prefijo alternativo para OC
    DEBRIS: ['RYR', 'RET', 'MOVIL_RYR'], // Identificadores Retiro -> finished_at
} as const;
