export enum OTState {
    CREADA = 'CREADA',                     // Nada ha pasado

    // El flujo se define por lo que FALTA:

    PENDIENTE_OBRA_CIVIL = 'PENDIENTE_OC', // Ya tiene Hidráulico -> Falta Civil
    PENDIENTE_RETIRO = 'PENDIENTE_RET',    // Ya tiene Civil (y quizás Hid) -> Falta Retiro

    POR_PAGAR = 'POR_PAGAR',               // Tiene TODO (Hid + Civ + Ret) -> Listo para cobrar

    PAGADA = 'PAGADA',                     // Financiero
    ANULADA = 'ANULADA',
    OBSERVADA = 'OBSERVADA'                // New State: Inconsistencia detectada (ej. Retiro sin Civil)
}
