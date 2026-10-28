export const ESTADOS_LOCAL_OPTIONS = [
    { value: 'Ocupado', label: 'Ocupado' },
    { value: 'Disponible', label: 'Disponible' },
    { value: 'Mantenimiento', label: 'Mantenimiento' },
    { value: 'Reservado', label: 'Reservado' },
];

export const formatMoney = (amount: number | null | undefined): string => {
    if (amount === null || amount === undefined) return '$0.00 MXN';
    return `$${Number(amount).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
};

export const formatPercentage = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '0%';
    return `${Math.round(value)}%`;
};

