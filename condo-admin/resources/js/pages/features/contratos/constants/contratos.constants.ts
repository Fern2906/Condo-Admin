import type { ContratoData, ContratoForm, EstadoContrato, TipoRelacion } from '@/types/contratos.types';

export const TIPO_RELACION_OPTIONS: { value: TipoRelacion; label: string }[] = [
    { value: 'locatario', label: 'Locatario' },
    { value: 'propietario', label: 'Propietario' },
    { value: 'otro', label: 'Otro' },
];

export const TIPO_RELACION_COLOR: Record<TipoRelacion, string> = {
    locatario: 'blue',
    propietario: 'indigo',
    otro: 'gray',
};

export const ESTADO_CONTRATO_OPTIONS = [
    { value: 'vigente', label: 'Vigente' },
    { value: 'por_vencer', label: 'Por vencer (≤ 30 días)' },
    { value: 'vencido', label: 'Vencido' },
    { value: 'indefinido', label: 'Indefinido / Sin fin' },
];

export const ESTADO_CONTRATO_COLOR: Record<EstadoContrato, string> = {
    vigente: 'green',
    por_vencer: 'orange',
    vencido: 'red',
    indefinido: 'blue',
};

export const getContratoEstado = (contrato: ContratoData): EstadoContrato => {
    if (contrato.fechaFin === null || contrato.diasRestantes === null) {
        return 'indefinido';
    }
    if (contrato.diasRestantes < 0) {
        return 'vencido';
    }
    if (contrato.diasRestantes <= 30) {
        return 'por_vencer';
    }
    return 'vigente';
};

export const getContratoEstadoLabel = (contrato: ContratoData): string => {
    const estado = getContratoEstado(contrato);
    if (estado === 'indefinido') return 'Indefinido';
    if (estado === 'vencido') return `Vencido (${Math.abs(contrato.diasRestantes!)} d)`;
    if (estado === 'por_vencer') return `Vence en ${contrato.diasRestantes} d`;
    return 'Vigente';
};

export const EMPTY_CONTRATO_FORM: ContratoForm = {
    localId: '',
    residenteId: '',
    tipoRelacion: 'locatario',
    habitaLocal: true,
    responsablePago: true,
    fechaInicio: new Date().toISOString().slice(0, 10),
    fechaFin: '',
};

export const toContratoForm = (contrato: ContratoData): ContratoForm => ({
    localId: contrato.localId,
    residenteId: contrato.residenteId,
    tipoRelacion: contrato.tipoRelacion,
    habitaLocal: contrato.habitaLocal,
    responsablePago: contrato.responsablePago,
    fechaInicio: contrato.fechaInicio,
    fechaFin: contrato.fechaFin ?? '',
});

export const formatDate = (value: string | null) => {
    if (!value) return 'Sin fecha';
    try {
        const [year, month, day] = value.split('-');
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

