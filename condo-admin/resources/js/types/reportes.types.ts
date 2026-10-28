export interface DesgloseLocal {
    id: number;
    codigo: string;
    nombre: string;
    edificio: string;
    nivel: string;
    estado: string;
    superficie: number;
    locatario: string;
    rentaMensual: number;
    cuotaMantenimiento: number;
    totalPagado: number;
    totalPendiente: number;
    totalPagos: number;
}

export interface ReportesStats {
    financiero: {
        totalRecaudado: number;
        totalPendiente: number;
        totalCargos: number;
        pagosValidadosCount: number;
        pagosPendientesCount: number;
    };
    ocupacion: {
        totalLocales: number;
        ocupados: number;
        disponibles: number;
        mantenimiento: number;
        reservados: number;
        tasaOcupacion: number;
        m2Total: number;
        m2Ocupados: number;
        porEdificio: Record<string, number>;
    };
    incidencias: {
        total: number;
        resueltas: number;
        abiertas: number;
        costoTotal: number;
        porPrioridad: Record<string, number>;
    };
    reservaciones: {
        total: number;
        aprobadas: number;
        porArea: { nombre: string; total: number }[];
    };
}

