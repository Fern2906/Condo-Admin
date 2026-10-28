import { useMemo, useState } from 'react';
import type { DesgloseLocal } from '@/types/reportes.types';

export const useReportesFilters = (locales: DesgloseLocal[]) => {
    const [search, setSearch] = useState('');
    const [estado, setEstado] = useState<string[]>([]);
    const [edificio, setEdificio] = useState<string[]>([]);

    const edificioOptions = useMemo(() => {
        const unique = [...new Set(locales.map((l) => l.edificio))].filter(Boolean).sort();
        return unique.map((e) => ({ value: e, label: e }));
    }, [locales]);

    const filteredLocales = useMemo(() => {
        const query = search.toLowerCase().trim();

        return locales.filter((local) => {
            const matchesSearch =
                query === '' ||
                local.codigo.toLowerCase().includes(query) ||
                local.nombre.toLowerCase().includes(query) ||
                local.locatario.toLowerCase().includes(query) ||
                local.edificio.toLowerCase().includes(query);

            const matchesEstado = estado.length === 0 || estado.includes(local.estado);
            const matchesEdificio = edificio.length === 0 || edificio.includes(local.edificio);

            return matchesSearch && matchesEstado && matchesEdificio;
        });
    }, [locales, search, estado, edificio]);

    const totales = useMemo(() => {
        const totalPagado = filteredLocales.reduce((acc, l) => acc + l.totalPagado, 0);
        const totalPendiente = filteredLocales.reduce((acc, l) => acc + l.totalPendiente, 0);
        const totalSuperficie = filteredLocales.reduce((acc, l) => acc + l.superficie, 0);

        return {
            totalPagado,
            totalPendiente,
            totalSuperficie,
        };
    }, [filteredLocales]);

    return {
        search,
        setSearch,
        estado,
        setEstado,
        edificio,
        setEdificio,
        edificioOptions,
        filteredLocales,
        totales,
    };
};

