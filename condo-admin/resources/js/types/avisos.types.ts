export interface AvisoData {
    id: number;
    titulo: string;
    contenido: string;
    tipo: 'general' | 'mantenimiento' | 'evento' | 'urgente';
    dirigidoA: 'todos' | 'propietarios' | 'locatarios' | 'administradores';
    fechaEvento: string | null;
    fechaPublicacion: string;
    fechaExpiracion: string | null;
    fijado: boolean;
    activo: boolean;
    vigente: boolean;
    publicadoPorId: number;
    publicadoPorNombre: string;
}

export type TipoAviso = AvisoData['tipo'];
export type DirigidoA = AvisoData['dirigidoA'];

export interface AvisoForm {
    titulo: string;
    contenido: string;
    tipo: TipoAviso;
    dirigidoA: DirigidoA;
    fechaEvento: string;
    fechaPublicacion: string;
    fechaExpiracion: string;
    fijado: boolean;
    activo: boolean;
}
