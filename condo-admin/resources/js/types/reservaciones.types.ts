export interface AreaComunData {
    id: number;
    nombre: string;
    descripcion: string | null;
    capacidad: number | null;
    horaApertura: string;
    horaCierre: string;
    reservable: boolean;
    requiereAprobacion: boolean;
    reglas: string | null;
    reservacionesCount: number;
}

export interface ReservacionData {
    id: number;
    areaComunId: number;
    areaComunNombre: string;
    usuarioId: number;
    usuarioNombre: string;
    usuarioEmail: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    numAsistentes: number | null;
    motivo: string | null;
    estado: 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada';
    motivoRechazo: string | null;
    adminNombre: string | null;
    createdAt: string;
}

export type ReservacionStatus = ReservacionData['estado'];

export type ReservacionForm = {
    areaComunId: number | string;
    usuarioId: number | string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    numAsistentes: number | string;
    motivo: string;
    estado: ReservacionStatus;
    motivoRechazo: string;
};

export type AreaComunForm = {
    nombre: string;
    descripcion: string;
    capacidad: number | string;
    horaApertura: string;
    horaCierre: string;
    reservable: boolean;
    requiereAprobacion: boolean;
    reglas: string;
};

export interface UsuarioOption {
    id: number;
    name: string;
    email: string;
}
