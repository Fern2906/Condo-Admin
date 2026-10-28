import { useMemo, useState } from 'react';
import type { AvisoData } from '@/types/avisos.types';

export const useAvisosFilters = (avisos: AvisoData[]) => {
    const [search, setSearch] = useState('');
    const [tipo, setTipo] = useState<string[]>([]);
    const [dirigidoA, setDirigidoA] = useState<string[]>([]);
    const [estado, setEstado] = useState<string[]>([]);

    const filteredAvisos = useMemo(() => {
        const query = search.toLowerCase();

        return avisos.filter((aviso) => {
            const matchesSearch =
                query === '' ||
                aviso.titulo.toLowerCase().includes(query) ||
                aviso.contenido.toLowerCase().includes(query) ||
                aviso.publicadoPorNombre.toLowerCase().includes(query);

            const matchesTipo = tipo.length === 0 || tipo.includes(aviso.tipo);
            const matchesDirigido = dirigidoA.length === 0 || dirigidoA.includes(aviso.dirigidoA);
            const matchesEstado =
                estado.length === 0 ||
                (estado.includes('activo') && aviso.activo) ||
                (estado.includes('inactivo') && !aviso.activo) ||
                (estado.includes('vigente') && aviso.vigente) ||
                (estado.includes('expirado') && !aviso.vigente);

            return matchesSearch && matchesTipo && matchesDirigido && matchesEstado;
        });
    }, [avisos, search, tipo, dirigidoA, estado]);

    return {
        search,
        setSearch,
        tipo,
        setTipo,
        dirigidoA,
        setDirigidoA,
        estado,
        setEstado,
        filteredAvisos,
    };
};
