export type TipoRelacion = 'propietario' | 'locatario' | 'otro';

export type EstadoContrato = 'vigente' | 'por_vencer' | 'vencido' | 'indefinido';

export interface ContratoData {
    id: number;
    localId: number;
    localCodigo: string;
    localNombre: string;
    residenteId: number;
    residenteNombre: string;
    residenteEmail: string;
    residenteTelefono: string | null;
    tipoRelacion: TipoRelacion;
    habitaLocal: boolean;
    responsablePago: boolean;
    fechaInicio: string;
    fechaFin: string | null;
    diasRestantes: number | null;
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

export interface ContratoForm {
    localId: number | string;
    residenteId: number | string;
    tipoRelacion: TipoRelacion;
    habitaLocal: boolean;
    responsablePago: boolean;
    fechaInicio: string;
    fechaFin: string;
}

