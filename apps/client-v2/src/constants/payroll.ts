/**
 * Payroll Business Constants
 * 
 * Centralized location for all payroll-related constants to ensure
 * consistency between frontend and backend.
 */

/**
 * Transaction Types
 * Maps API values to user-friendly labels
 */
export const TRANSACTION_TYPES = {
    SALARY: 'Sueldo Base',
    BONUS: 'Bono',
    ADVANCE: 'Anticipo',
    ABSENCE: 'Descuento',
    LOAN: 'Préstamo'
} as const;

export type TransactionType = keyof typeof TRANSACTION_TYPES;

/**
 * Chilean Banks (SBIF)
 * List of banks supported for payroll transfers
 */
export const CHILEAN_BANKS = [
    'BANCO DE CHILE',
    'BANCO INTERNACIONAL',
    'BANCO DEL ESTADO',
    'SCOTIABANK',
    'BANCO BCI',
    'BANCO BICE',
    'HSBC BANK',
    'BANCO SANTANDER',
    'ITAU',
    'BANCO SECURITY',
    'BANCO FALABELLA',
    'BANCO RIPLEY',
    'BANCO CONSORCIO'
] as const;

export type ChileanBank = typeof CHILEAN_BANKS[number];

/**
 * Account Types
 * Supported bank account types in Chile
 */
export const ACCOUNT_TYPES = [
    { value: 'CUENTA_CORRIENTE', label: 'Cuenta Corriente' },
    { value: 'CUENTA_VISTA', label: 'Cuenta Vista' },
    { value: 'CUENTA_RUT', label: 'Cuenta RUT' }
] as const;

export type AccountType = typeof ACCOUNT_TYPES[number]['value'];
