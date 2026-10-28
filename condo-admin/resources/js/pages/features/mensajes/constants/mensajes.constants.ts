export const TIPO_SOLICITUD_COLOR: Record<string, string> = {
    queja: 'red',
    sugerencia: 'blue',
    consulta: 'cyan',
    tramite: 'violet',
};

export const ESTADO_SOLICITUD_COLOR: Record<string, string> = {
    pendiente: 'yellow',
    en_revision: 'orange',
    atendida: 'green',
    cerrada: 'gray',
};

export const formatMessageTime = (dateStr?: string, fallbackHora?: string): string => {
    if (fallbackHora) return fallbackHora;
    if (!dateStr) return '';
    try {
        return new Date(dateStr).toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return dateStr;
    }
};

