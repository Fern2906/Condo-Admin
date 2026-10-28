export interface MensajeData {
    id: number;
    emisorId: number;
    emisorNombre: string;
    emisorEmail: string;
    receptorId: number | null;
    receptorNombre: string;
    solicitudId: number | null;
    solicitudAsunto?: string | null;
    mensaje: string;
    leido: boolean;
    createdAt?: string;
    hora: string;
    fecha?: string;
}

export interface ContactoOption {
    id: number;
    name: string;
    email: string;
}

export interface SolicitudOption {
    id: number;
    asunto: string;
    tipo: string;
    estado: string;
    usuarioId: number;
}

export interface CurrentUser {
    id: number;
    name: string;
    email: string;
}

