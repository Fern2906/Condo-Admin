import dayjs from 'dayjs';
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

// Función y no constante: la fecha de hoy (local, no UTC) se calcula al abrir el formulario.
export const emptyPagoForm = (): PagoForm => ({
    localId: '',
    residenteId: '',
    monto: '',
    fechaPago: dayjs().format('YYYY-MM-DD'),
    estado: 'pendiente',
    notas: '',
    comprobanteUrl: '',
    motivoRechazo: '',
    cargoIds: [],
});

export const toPagoForm = (pago: PagoData): PagoForm => ({
    localId: pago.localId,
    residenteId: pago.residenteId ?? '',
    monto: pago.monto,
    fechaPago: pago.fechaPago,
    estado: pago.estado,
    notas: pago.notas ?? '',
    comprobanteUrl: pago.comprobanteUrl ?? '',
    motivoRechazo: pago.motivoRechazo ?? '',
    cargoIds: pago.cargosAplicados.map((c) => String(c.id)),
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

