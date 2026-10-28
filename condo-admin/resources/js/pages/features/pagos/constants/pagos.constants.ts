import type { EstadoPago, PagoData, PagoForm } from '@/types/pagos.types';

export const ESTADOS_PAGO_OPTIONS: { value: EstadoPago; label: string }[] = [
    { value: 'validado', label: 'Validado' },
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'rechazado', label: 'Rechazado' },
];

export const ESTADOS_PAGO_COLOR: Record<EstadoPago, string> = {
    validado: 'green',
    pendiente: 'yellow',
    rechazado: 'red',
};

export const EMPTY_PAGO_FORM: PagoForm = {
    localId: '',
    residenteId: '',
    monto: '',
    fechaPago: new Date().toISOString().slice(0, 10),
    estado: 'pendiente',
    notas: '',
    comprobanteUrl: '',
    motivoRechazo: '',
};

export const toPagoForm = (pago: PagoData): PagoForm => ({
    localId: pago.localId,
    residenteId: pago.residenteId ?? '',
    monto: pago.monto,
    fechaPago: pago.fechaPago,
    estado: pago.estado,
    notas: pago.notas ?? '',
    comprobanteUrl: pago.comprobanteUrl ?? '',
    motivoRechazo: pago.motivoRechazo ?? '',
});

export const formatMoney = (amount: number | string | null | undefined): string => {
    if (amount === null || amount === undefined || amount === '') return '$0.00 MXN';
    return `$${Number(amount).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
};

export const formatDate = (value: string | null | undefined): string => {
    if (!value) return 'Sin fecha';
    try {
        const [year, month, day] = value.split('T')[0].split('-');
        if (year && month && day) {
            return `${day}/${month}/${year}`;
        }
        return new Date(value).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    } catch {
        return value;
    }
};

