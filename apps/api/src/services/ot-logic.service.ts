import { OTState } from '../api/types/ot.enums';

export const inferirEstadoOT = (
    hidraulicoId: string | null | undefined,
    civilId: string | null | undefined,
    retiroId: string | null | undefined,
    estadoActual?: string
): OTState => {
    // 1. Inmutabilidad (No tocar si ya está cerrado)
    if (estadoActual === OTState.PAGADA) return OTState.PAGADA;
    if (estadoActual === OTState.ANULADA) return OTState.ANULADA;

    // 2. Meta Final
    if (hidraulicoId && civilId && retiroId) return OTState.POR_PAGAR;

    // 3. Lógica de "Siguiente Paso"

    // Si ya tiene Civil (y asumimos Hidráulico), lo único que falta es limpiar.
    if (civilId) return OTState.PENDIENTE_RETIRO;

    // Si tiene Hidráulico pero NO Civil, falta la Obra Civil.
    if (hidraulicoId && !civilId) return OTState.PENDIENTE_OBRA_CIVIL;

    // Si solo tiene Retiro (Caso borde raro), asumimos que falta validar civil/hid
    // O se puede dejar en PENDIENTE_RETIRO si asumimos que es un update parcial.
    // Regla segura:
    if (retiroId && !civilId) return OTState.PENDIENTE_OBRA_CIVIL;

    return OTState.CREADA;
};
