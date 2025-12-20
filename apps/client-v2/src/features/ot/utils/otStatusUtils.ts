
// Mapeo de estados a UX
export const STATE_CONFIG: Record<string, { label: string; color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' }> = {
    'CREADA': { label: '🆕 Creada', color: 'default' },
    'PENDIENTE_OC': { label: '🚧 Falta Civil', color: 'warning' }, // Match API Value
    'PENDIENTE_RET': { label: '🧹 Falta Retiro', color: 'info' },   // Match API Value
    'OBRA_TERMINADA': { label: '🏗️ Obra Lista', color: 'info' },   // Legacy/Fallback
    'POR_PAGAR': { label: '💰 Por Pagar', color: 'success' },
    'PAGADA': { label: '✅ Pagada', color: 'primary' },
    'ANULADA': { label: '🚫 Anulada', color: 'error' },
    'OBSERVADA': { label: '⚠️ Observada', color: 'warning' }, // New State
};

export const getDaysDiff = (dateString?: string | null) => {
    if (!dateString) return 0;
    const start = new Date(dateString);
    const now = new Date();
    if (isNaN(start.getTime())) return 0;

    // Diferencia en milisegundos dividida por ms en un día
    const diffTime = now.getTime() - start.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const getOTStateConfig = (status: string | undefined) => {
    if (!status) return { label: 'Desconocido', color: 'default' as const };
    return STATE_CONFIG[status] || { label: status, color: 'default' as const };
};

export const isOTDelayed = (status: string | undefined, dateString?: string | null) => {
    if (status !== 'PENDIENTE_OC') return false;
    const daysElapsed = getDaysDiff(dateString);
    return daysElapsed >= 3;
};
