import type { ReservacionData, ReservacionForm, AreaComunData, AreaComunForm } from '@/types/reservaciones.types';

export const ESTADOS_RESERVACION: ReservacionData['estado'][] = ['pendiente', 'aprobada', 'rechazada', 'cancelada'];

export const estadoColor: Record<ReservacionData['estado'], string> = {
    pendiente: 'yellow',
    aprobada: 'green',
    rechazada: 'red',
    cancelada: 'gray',
};

export const EMPTY_RESERVACION: ReservacionForm = {
    areaComunId: '',
    usuarioId: '',
    fecha: '',
    horaInicio: '',
    horaFin: '',
    numAsistentes: '',
    motivo: '',
    estado: 'pendiente',
    motivoRechazo: '',
};

export const toReservacionForm = (r: ReservacionData): ReservacionForm => ({
    areaComunId: r.areaComunId,
    usuarioId: r.usuarioId,
    fecha: r.fecha,
    horaInicio: r.horaInicio,
    horaFin: r.horaFin,
    numAsistentes: r.numAsistentes ?? '',
    motivo: r.motivo ?? '',
    estado: r.estado,
    motivoRechazo: r.motivoRechazo ?? '',
});

export const EMPTY_AREA_COMUN: AreaComunForm = {
    nombre: '',
    descripcion: '',
    capacidad: '',
    horaApertura: '08:00',
    horaCierre: '22:00',
    reservable: true,
    requiereAprobacion: false,
    reglas: '',
};

export const toAreaComunForm = (a: AreaComunData): AreaComunForm => ({
    nombre: a.nombre,
    descripcion: a.descripcion ?? '',
    capacidad: a.capacidad ?? '',
    horaApertura: a.horaApertura,
    horaCierre: a.horaCierre,
    reservable: a.reservable,
    requiereAprobacion: a.requiereAprobacion,
    reglas: a.reglas ?? '',
});
