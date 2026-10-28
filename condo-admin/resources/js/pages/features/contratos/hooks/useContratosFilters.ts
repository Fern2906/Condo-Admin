import { useMemo, useState } from 'react';
import type { ContratoData } from '@/types/contratos.types';
import { getContratoEstado } from '../constants/contratos.constants';

export const useContratosFilters = (contratos: ContratoData[]) => {
    const [search, setSearch] = useState('');
    const [tipoRelacion, setTipoRelacion] = useState<string[]>([]);
    const [estado, setEstado] = useState<string[]>([]);
    const [local, setLocal] = useState<string[]>([]);

    const localOptions = useMemo(() => {
        const unique = new Map<number, string>();
        contratos.forEach((c) => {
            if (!unique.has(c.localId)) {
                unique.set(c.localId, `${c.localCodigo} · ${c.localNombre}`);
            }
        });

        return Array.from(unique.entries())
            .sort((a, b) => a[1].localeCompare(b[1]))
            .map(([id, label]) => ({
                value: String(id),
                label,
            }));
    }, [contratos]);

    const filteredContratos = useMemo(() => {
        const query = search.toLowerCase().trim();

        return contratos.filter((contrato) => {
            const matchesSearch =
                query === '' ||
                contrato.residenteNombre.toLowerCase().includes(query) ||
                contrato.residenteEmail.toLowerCase().includes(query) ||
                contrato.localCodigo.toLowerCase().includes(query) ||
                contrato.localNombre.toLowerCase().includes(query);

            const matchesTipo = tipoRelacion.length === 0 || tipoRelacion.includes(contrato.tipoRelacion);

            const contratoEstado = getContratoEstado(contrato);
            const matchesEstado = estado.length === 0 || estado.includes(contratoEstado);

            const matchesLocal = local.length === 0 || local.includes(String(contrato.localId));

            return matchesSearch && matchesTipo && matchesEstado && matchesLocal;
        });
    }, [contratos, search, tipoRelacion, estado, local]);

    const stats = useMemo(() => {
        const total = contratos.length;
        let vigentes = 0;
        let porVencer = 0;
        let vencidos = 0;

        contratos.forEach((c) => {
            const st = getContratoEstado(c);
            if (st === 'vigente' || st === 'indefinido') {
                vigentes++;
            } else if (st === 'por_vencer') {
                porVencer++;
            } else if (st === 'vencido') {
                vencidos++;
            }
        });

        return {
            total,
            vigentes,
            porVencer,
            vencidos,
        };
    }, [contratos]);

    return {
        search,
        setSearch,
        tipoRelacion,
        setTipoRelacion,
        estado,
        setEstado,
        local,
        setLocal,
        localOptions,
        filteredContratos,
        stats,
    };
};

