import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { router, useForm } from '@inertiajs/react';
import ReservacionController from '@/actions/App/Http/Controllers/ReservacionController';
import AreaComunController from '@/actions/App/Http/Controllers/AreaComunController';
import type { ReservacionData, ReservacionForm, AreaComunData, AreaComunForm } from '@/types/reservaciones.types';
import { EMPTY_RESERVACION, toReservacionForm, EMPTY_AREA_COMUN, toAreaComunForm } from '../constants/reservaciones.constants';

export const useReservacionesActions = (reservaciones: ReservacionData[]) => {
    const [selection, setSelection] = useState<number[]>([]);
    const [editingResId, setEditingResId] = useState<number | null>(null);
    const [editingAreaId, setEditingAreaId] = useState<number | null>(null);
    const [selectedResId, setSelectedResId] = useState<number | null>(null);

    const [resModalOpened, { open: openResModal, close: closeResModal }] = useDisclosure(false);
    const [areaModalOpened, { open: openAreaModal, close: closeAreaModal }] = useDisclosure(false);
    const [detailDrawerOpened, { open: openDetailDrawer, close: closeDetailDrawer }] = useDisclosure(false);

    const resForm = useForm<ReservacionForm>(EMPTY_RESERVACION);
    const areaForm = useForm<AreaComunForm>(EMPTY_AREA_COMUN);
    const selectedRes = reservaciones.find((r) => r.id === selectedResId) ?? null;

    const toggleRow = (id: number) => setSelection((cur) => (cur.includes(id) ? cur.filter((i) => i !== id) : [...cur, id]));
    const toggleAll = (filtered: ReservacionData[]) => setSelection((cur) => (cur.length === filtered.length ? [] : filtered.map((r) => r.id)));

    const handleOpenCreateRes = () => {
        setEditingResId(null);
        resForm.clearErrors();
        resForm.setData(EMPTY_RESERVACION);
        openResModal();
    };

    const handleOpenEditRes = (r: ReservacionData) => {
        setEditingResId(r.id);
        resForm.clearErrors();
        resForm.setData(toReservacionForm(r));
        openResModal();
    };

    const handleViewDetail = (r: ReservacionData) => {
        setSelectedResId(r.id);
        openDetailDrawer();
    };

    const handleSubmitRes = () => {
        resForm.submit(
            editingResId === null ? ReservacionController.store() : ReservacionController.update(editingResId),
            {
                preserveScroll: true,
                onSuccess: () => {
                    closeResModal();
                    resForm.reset();
                },
            }
        );
    };

    const handleDeleteRes = (r: ReservacionData) => {
        if (!window.confirm(`¿Eliminar la reservación de ${r.usuarioNombre} en ${r.areaComunNombre}?`)) return;
        router.delete(ReservacionController.destroy(r.id), {
            preserveScroll: true,
            onSuccess: () => setSelection((cur) => cur.filter((id) => id !== r.id)),
        });
    };

    const handleDeleteManyRes = () => {
        if (!window.confirm(`¿Eliminar ${selection.length} reservaciones?`)) return;
        router.delete(ReservacionController.destroyMany(), {
            data: { ids: selection },
            preserveScroll: true,
            onSuccess: () => setSelection([]),
        });
    };

    const handleApproveSelected = () => {
        router.patch(ReservacionController.updateStatus(), { ids: selection, estado: 'aprobada' }, { preserveScroll: true, onSuccess: () => setSelection([]) });
    };

    const handleRejectSelected = () => {
        router.patch(ReservacionController.updateStatus(), { ids: selection, estado: 'rechazada' }, { preserveScroll: true, onSuccess: () => setSelection([]) });
    };

    const handleOpenCreateArea = () => {
        setEditingAreaId(null);
        areaForm.clearErrors();
        areaForm.setData(EMPTY_AREA_COMUN);
        openAreaModal();
    };

    const handleOpenEditArea = (a: AreaComunData) => {
        setEditingAreaId(a.id);
        areaForm.clearErrors();
        areaForm.setData(toAreaComunForm(a));
        openAreaModal();
    };

    const handleSubmitArea = () => {
        areaForm.submit(
            editingAreaId === null ? AreaComunController.store() : AreaComunController.update(editingAreaId),
            {
                preserveScroll: true,
                onSuccess: () => {
                    closeAreaModal();
                    areaForm.reset();
                },
            }
        );
    };

    const handleDeleteArea = (a: AreaComunData) => {
        if (!window.confirm(`¿Eliminar el área "${a.nombre}"? Esta acción no se puede deshacer.`)) return;
        router.delete(AreaComunController.destroy(a.id), { preserveScroll: true });
    };

    return {
        selection,
        setSelection,
        toggleRow,
        toggleAll,
        editingResId,
        editingAreaId,
        selectedResId,
        selectedRes,
        resModalOpened,
        closeResModal,
        areaModalOpened,
        closeAreaModal,
        detailDrawerOpened,
        closeDetailDrawer,
        resForm,
        areaForm,
        handleOpenCreateRes,
        handleOpenEditRes,
        handleViewDetail,
        handleSubmitRes,
        handleDeleteRes,
        handleDeleteManyRes,
        handleApproveSelected,
        handleRejectSelected,
        handleOpenCreateArea,
        handleOpenEditArea,
        handleSubmitArea,
        handleDeleteArea,
    };
};
