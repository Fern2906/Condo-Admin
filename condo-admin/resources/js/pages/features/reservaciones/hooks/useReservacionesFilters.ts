import { useMemo, useState } from 'react';
import type { ReservacionData, AreaComunData } from '@/types/reservaciones.types';

export const useReservacionesFilters = (reservaciones: ReservacionData[], areas: AreaComunData[]) => {
    const [activeTab, setActiveTab] = useState<'reservaciones' | 'areas'>('reservaciones');
    const [searchRes, setSearchRes] = useState('');
    const [filterEstado, setFilterEstado] = useState<string[]>([]);
    const [filterArea, setFilterArea] = useState<string[]>([]);
    const [searchArea, setSearchArea] = useState('');

    const areaFilterOptions = useMemo(() => areas.map((a) => ({ value: String(a.id), label: a.nombre })), [areas]);
    const estadoOptions = useMemo(
        () => [
            { value: 'pendiente', label: 'Pendiente' },
            { value: 'aprobada', label: 'Aprobada' },
            { value: 'rechazada', label: 'Rechazada' },
            { value: 'cancelada', label: 'Cancelada' },
        ],
        []
    );

    const stats = useMemo(() => {
        const hoy = new Date().toISOString().split('T')[0];
        return {
            total: reservaciones.length,
            pendientes: reservaciones.filter((r) => r.estado === 'pendiente').length,
            aprobadas: reservaciones.filter((r) => r.estado === 'aprobada').length,
            hoy: reservaciones.filter((r) => r.fecha === hoy).length,
        };
    }, [reservaciones]);

    const filteredRes = useMemo(() => {
        const q = searchRes.toLowerCase();
        return reservaciones.filter((r) => {
            const matchSearch =
                q === '' ||
                r.areaComunNombre.toLowerCase().includes(q) ||
                r.usuarioNombre.toLowerCase().includes(q) ||
                r.fecha.includes(q);
            const matchEstado = filterEstado.length === 0 || filterEstado.includes(r.estado);
            const matchArea = filterArea.length === 0 || filterArea.includes(String(r.areaComunId));
            return matchSearch && matchEstado && matchArea;
        });
    }, [reservaciones, searchRes, filterEstado, filterArea]);

    const filteredAreas = useMemo(() => {
        const q = searchArea.toLowerCase();
        return areas.filter(
            (a) => q === '' || a.nombre.toLowerCase().includes(q) || (a.descripcion?.toLowerCase().includes(q) ?? false)
        );
    }, [areas, searchArea]);

    return {
        activeTab,
        setActiveTab,
        searchRes,
        setSearchRes,
        filterEstado,
        setFilterEstado,
        filterArea,
        setFilterArea,
        searchArea,
        setSearchArea,
        areaFilterOptions,
        estadoOptions,
        stats,
        filteredRes,
        filteredAreas,
    };
};
