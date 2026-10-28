import type { AvisoData, AvisoForm, DirigidoA, TipoAviso } from '@/types/avisos.types';

export const TIPO_OPTIONS: { value: TipoAviso; label: string }[] = [
    { value: 'general', label: 'General' },
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'evento', label: 'Evento' },
    { value: 'urgente', label: 'Urgente' },
];

export const DIRIGIDO_OPTIONS: { value: DirigidoA; label: string }[] = [
    { value: 'todos', label: 'Todos' },
    { value: 'propietarios', label: 'Propietarios' },
    { value: 'locatarios', label: 'Locatarios' },
    { value: 'administradores', label: 'Administradores' },
];

export const TIPO_COLOR: Record<TipoAviso, string> = {
    general: 'blue',
    mantenimiento: 'orange',
    evento: 'violet',
    urgente: 'red',
};

export const DIRIGIDO_COLOR: Record<DirigidoA, string> = {
    todos: 'gray',
    propietarios: 'cyan',
    locatarios: 'teal',
    administradores: 'indigo',
};

export const EMPTY_AVISO_FORM: AvisoForm = {
    titulo: '',
    contenido: '',
    tipo: 'general',
    dirigidoA: 'todos',
    fechaEvento: '',
    fechaPublicacion: '',
    fechaExpiracion: '',
    fijado: false,
    activo: true,
};

export const toAvisoForm = (aviso: AvisoData): AvisoForm => ({
    titulo: aviso.titulo,
    contenido: aviso.contenido,
    tipo: aviso.tipo,
    dirigidoA: aviso.dirigidoA,
    fechaEvento: aviso.fechaEvento ? aviso.fechaEvento.slice(0, 16) : '',
    fechaPublicacion: aviso.fechaPublicacion ? aviso.fechaPublicacion.slice(0, 16) : '',
    fechaExpiracion: aviso.fechaExpiracion ? aviso.fechaExpiracion.slice(0, 16) : '',
    fijado: aviso.fijado,
    activo: aviso.activo,
});

export const formatDateTime = (value: string | null) => {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
        return value;
    }
};
