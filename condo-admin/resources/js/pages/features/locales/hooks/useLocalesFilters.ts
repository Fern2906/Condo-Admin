import { useMemo, useState } from 'react';
import type { LocalData } from '@/types/locales.types';

export const useLocalesFilters = (locales: LocalData[]) => {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<string[]>([]);
    const [building, setBuilding] = useState<string[]>([]);

    const statusData = useMemo(
        () => [
            { value: 'Disponible', label: 'Disponible' },
            { value: 'Ocupado', label: 'Ocupado' },
            { value: 'Mantenimiento', label: 'Mantenimiento' },
            { value: 'Reservado', label: 'Reservado' },
        ],
        []
    );

    const buildingData = useMemo(
        () => [...new Set(locales.map((l) => l.building))].sort().map((b) => ({ value: b, label: b })),
        [locales]
    );

    const filteredLocales = useMemo(() => {
        return locales.filter((local) => {
            const matchesSearch =
                search === '' ||
                local.code.toLowerCase().includes(search.toLowerCase()) ||
                local.name.toLowerCase().includes(search.toLowerCase()) ||
                (local.tenantName && local.tenantName.toLowerCase().includes(search.toLowerCase())) ||
                local.building.toLowerCase().includes(search.toLowerCase());

            const matchesStatus = status.length === 0 || status.includes(local.status);
            const matchesBuilding = building.length === 0 || building.includes(local.building);

            return matchesSearch && matchesStatus && matchesBuilding;
        });
    }, [locales, search, status, building]);

    const stats = useMemo(() => {
        const totalLocales = locales.length;
        const occupiedCount = locales.filter((l) => l.status === 'Ocupado').length;
        const availableCount = locales.filter((l) => l.status === 'Disponible').length;
        const maintenanceCount = locales.filter((l) => l.status === 'Mantenimiento').length;
        const occupiedPercentage = totalLocales > 0 ? Math.round((occupiedCount / totalLocales) * 100) : 0;

        return {
            totalLocales,
            occupiedCount,
            availableCount,
            maintenanceCount,
            occupiedPercentage,
        };
    }, [locales]);

    return {
        search,
        setSearch,
        status,
        setStatus,
        building,
        setBuilding,
        statusData,
        buildingData,
        filteredLocales,
        stats,
    };
};
