export type EstadoPago = 'pendiente' | 'validado' | 'rechazado';

export interface PagoData {
    id: number;
    localId: number;
    localCodigo: string;
    localNombre: string;
    residenteId: number | null;
    residenteNombre: string;
    residenteEmail: string;
    monto: number;
    fechaPago: string;
    comprobanteUrl: string | null;
    estado: EstadoPago;
    registradoPorId: number;
    registradoPorNombre: string;
    validadoPorId: number | null;
    validadoPorNombre: string | null;
    fechaValidacion: string | null;
    motivoRechazo: string | null;
    notas: string | null;
    reciboFolio?: string | null;
    createdAt?: string | null;
}

export interface LocalOption {
    id: number;
    label: string;
}

export interface ResidenteOption {
    id: number;
    name: string;
    email: string;
}

export interface CuotaOption {
    id: number;
    nombre: string;
    tipo: string;
    monto: number;
}

export interface PagoForm {
    localId: number | string;
    residenteId: number | string;
    monto: number | string;
    fechaPago: string;
    estado: EstadoPago;
    notas: string;
    comprobanteUrl: string;
    motivoRechazo: string;
}

