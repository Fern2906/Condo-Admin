import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { router, useForm } from '@inertiajs/react';
import AvisoController from '@/actions/App/Http/Controllers/AvisoController';
import type { AvisoData, AvisoForm } from '@/types/avisos.types';
import { EMPTY_AVISO_FORM, toAvisoForm } from '../constants/avisos.constants';

export const useAvisosActions = (avisos: AvisoData[]) => {
    const [selection, setSelection] = useState<number[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false);
    const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);

    const form = useForm<AvisoForm>(EMPTY_AVISO_FORM);
    const selectedAviso = avisos.find((a) => a.id === selectedId) ?? null;

    const handleOpenCreate = () => {
        setEditingId(null);
        form.clearErrors();
        form.setData(EMPTY_AVISO_FORM);
        openForm();
    };

    const handleOpenEdit = (aviso: AvisoData) => {
        setEditingId(aviso.id);
        form.clearErrors();
        form.setData(toAvisoForm(aviso));
        openForm();
    };

    const handleViewDetail = (aviso: AvisoData) => {
        setSelectedId(aviso.id);
        openDetail();
    };

    const handleSubmit = () => {
        form.submit(editingId === null ? AvisoController.store() : AvisoController.update(editingId), {
            preserveScroll: true,
            onSuccess: () => {
                closeForm();
                form.reset();
            },
        });
    };

    const handleDelete = (aviso: AvisoData) => {
        if (!window.confirm(`¿Eliminar el aviso "${aviso.titulo}"? Esta acción no se puede deshacer.`)) return;
        router.delete(AvisoController.destroy(aviso.id), {
            preserveScroll: true,
            onSuccess: () => setSelection((prev) => prev.filter((id) => id !== aviso.id)),
        });
    };

    const handleDeleteSelected = () => {
        if (!window.confirm(`¿Eliminar ${selection.length} avisos? Esta acción no se puede deshacer.`)) return;
        router.delete(AvisoController.destroyMany(), {
            data: { ids: selection },
            preserveScroll: true,
            onSuccess: () => setSelection([]),
        });
    };

    const handleToggleActive = (ids: number[], activo: boolean) => {
        router.patch(
            AvisoController.updateStatus(),
            { ids, activo },
            { preserveScroll: true, onSuccess: () => setSelection([]) },
        );
    };

    const handleToggleActiveSingle = (aviso: AvisoData) => {
        router.patch(
            AvisoController.updateStatus(),
            { ids: [aviso.id], activo: !aviso.activo },
            { preserveScroll: true },
        );
    };

    return {
        selection,
        setSelection,
        formOpened,
        closeForm,
        detailOpened,
        closeDetail,
        editingId,
        selectedAviso,
        form,
        handleOpenCreate,
        handleOpenEdit,
        handleViewDetail,
        handleSubmit,
        handleDelete,
        handleDeleteSelected,
        handleToggleActive,
        handleToggleActiveSingle,
    };
};
