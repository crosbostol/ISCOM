import { OTState } from '../api/types/ot.enums';

export const inferirEstadoOT = (
    hidraulicoId: string | null | undefined,
    civilId: string | null | undefined,
    retiroId: string | null | undefined,
    retiroFinishedAt: Date | string | null | undefined,
    estadoActual?: string
): OTState => {
    // 1. Inmutabilidad (Prioridad Máxima)
    if (estadoActual === OTState.PAGADA) return OTState.PAGADA;
    if (estadoActual === OTState.ANULADA) return OTState.ANULADA;

    // 2. Evaluar Finalización del Ciclo (Retiro)
    const tieneRetiroFinalizado = !!(retiroId && retiroFinishedAt);
    const tieneAntecedentes = !!(hidraulicoId || civilId);

    if (tieneRetiroFinalizado) {
        // --- NUEVA REGLA: DETECCIÓN DE SALTO DE PROCESO ---
        // Si se hizo trabajo hidráulico (hoyo), DEBE haber registro civil (tapar) 
        // antes de considerar válido el retiro (limpiar).
        if (tieneAntecedentes && !civilId) {
            return OTState.OBSERVADA; // Faltan antecedentes Civiles (tiene Hid pero no Civ)
        }

        if (tieneAntecedentes) {
            // Ciclo completo y coherente
            return OTState.POR_PAGAR;
        } else {
            // ALERTA DE INTEGRIDAD: 
            // Tenemos el final de la historia (Retiro) pero falta el inicio.
            // No podemos pagarla ciegamente.
            return OTState.OBSERVADA;
        }
    }

    // 3. Progreso Parcial (Cascada hacia atrás)
    if (civilId) return OTState.PENDIENTE_RETIRO;
    if (hidraulicoId) return OTState.PENDIENTE_OBRA_CIVIL;

    return OTState.CREADA;
};
