export const SHARED_ITEM_NAMES = [
    'BASE ESTABILIZADA',
    // Futuros items compartidos van aquí
] as const;

export const isSharedItem = (description: string) =>
    SHARED_ITEM_NAMES.some(name => description.toUpperCase() === name);
