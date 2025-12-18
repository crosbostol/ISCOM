export const cleanRut = (rut: string | null | undefined): string => {
    if (!rut) return '';
    return rut.replace(/\./g, '').replace(/-/g, '');
};

export const validateRut = (rut: string | null | undefined): boolean => {
    if (!rut) return false;

    const cleaned = cleanRut(rut);
    if (cleaned.length < 2) return false;

    const body = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1).toUpperCase();

    // Validar que el cuerpo sean solo números
    if (!/^\d+$/.test(body)) return false;

    let sum = 0;
    let multiplier = 2;

    for (let i = body.length - 1; i >= 0; i--) {
        sum += parseInt(body.charAt(i)) * multiplier;
        multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }

    const expectedDv = 11 - (sum % 11);
    let calculatedDv = '';

    if (expectedDv === 11) calculatedDv = '0';
    else if (expectedDv === 10) calculatedDv = 'K';
    else calculatedDv = expectedDv.toString();

    return dv === calculatedDv;
};

export const formatRut = (rut: string | null | undefined): string => {
    const cleaned = cleanRut(rut);
    if (cleaned.length <= 1) return cleaned;

    const body = cleaned.slice(0, -1);
    const dv = cleaned.slice(-1).toUpperCase();

    let formattedBody = '';
    for (let i = body.length - 1, j = 0; i >= 0; i--, j++) {
        formattedBody = body.charAt(i) + (j > 0 && j % 3 === 0 ? '.' : '') + formattedBody;
    }

    return `${formattedBody}-${dv}`;
};
