export function parseChileanMoney(value: string | undefined): number {
    if (!value) return 0;
    // Remove "$", ".", and whitespace. Replace "," with "." for decimal.
    // Example: "$ 70.000,00" -> "70000.00"
    const clean = value.replace(/\$/g, '').replace(/\./g, '').replace(/\s/g, '').replace(',', '.');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
}

export function parseChileanDate(value: string | undefined): Date | null {
    if (!value) return null;
    // Format: dd-mm-YYYY
    const parts = value.trim().split('-');
    if (parts.length !== 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Months are 0-indexed
    const year = parseInt(parts[2], 10);

    const date = new Date(year, month, day);
    if (isNaN(date.getTime())) return null;
    return date;
}

export function parseNumberStreet(value: string | undefined): number {
    if (!value) return 0;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? 0 : parsed;
}
