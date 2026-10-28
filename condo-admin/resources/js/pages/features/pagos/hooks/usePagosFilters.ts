import { useMemo, useState } from 'react';
import type { PagoData } from '@/types/pagos.types';

export const usePagosFilters = (pagos: PagoData[]) => {
    const [search, setSearch] = useState('');
    const [estado, setEstado] = useState<string[]>([]);
    const [local, setLocal] = useState<string[]>([]);

    const localOptions = useMemo(() => {
        const unique = new Map<number, string>();
        pagos.forEach((p) => {
            if (!unique.has(p.localId)) {
                unique.set(p.localId, `${p.localCodigo} · ${p.localNombre}`);
            }
        });

        return Array.from(unique.entries())
            .sort((a, b) => a[1].localeCompare(b[1]))
            .map(([id, label]) => ({
                value: String(id),
                label,
            }));
    }, [pagos]);

    const filteredPagos = useMemo(() => {
        const query = search.toLowerCase().trim();

        return pagos.filter((pago) => {
            const matchesSearch =
                query === '' ||
                pago.localCodigo.toLowerCase().includes(query) ||
                pago.localNombre.toLowerCase().includes(query) ||
                pago.residenteNombre.toLowerCase().includes(query) ||
                pago.residenteEmail.toLowerCase().includes(query) ||
                (pago.reciboFolio && pago.reciboFolio.toLowerCase().includes(query)) ||
                (pago.notas && pago.notas.toLowerCase().includes(query));

            const matchesEstado = estado.length === 0 || estado.includes(pago.estado);
            const matchesLocal = local.length === 0 || local.includes(String(pago.localId));

            return matchesSearch && matchesEstado && matchesLocal;
        });
    }, [pagos, search, estado, local]);

    const stats = useMemo(() => {
        const total = pagos.length;
        let pendientes = 0;
        let validados = 0;
        let rechazados = 0;
        let montoValidados = 0;
        let montoPendientes = 0;

        pagos.forEach((p) => {
            if (p.estado === 'validado') {
                validados++;
                montoValidados += Number(p.monto) || 0;
            } else if (p.estado === 'pendiente') {
                pendientes++;
                montoPendientes += Number(p.monto) || 0;
            } else if (p.estado === 'rechazado') {
                rechazados++;
            }
        });

        return {
            total,
            pendientes,
            validados,
            rechazados,
            montoValidados,
            montoPendientes,
        };
    }, [pagos]);

    return {
        search,
        setSearch,
        estado,
        setEstado,
        local,
        setLocal,
        localOptions,
        filteredPagos,
        stats,
    };
};

