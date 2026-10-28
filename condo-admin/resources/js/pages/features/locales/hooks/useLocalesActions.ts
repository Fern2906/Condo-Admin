import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { router, useForm } from '@inertiajs/react';
import LocalController from '@/actions/App/Http/Controllers/LocalController';
import type { LocalData, LocalForm } from '@/types/locales.types';
import { EMPTY_LOCAL, toLocalForm } from '../constants/locales.constants';

export const useLocalesActions = (locales: LocalData[]) => {
    const [selection, setSelection] = useState<number[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
    const [detailDrawerOpened, { open: openDetailDrawer, close: closeDetailDrawer }] = useDisclosure(false);
    const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);

    const createForm = useForm<LocalForm>(EMPTY_LOCAL);
    const editForm = useForm<LocalForm>(EMPTY_LOCAL);
    const selectedLocal = locales.find((l) => l.id === selectedId) ?? null;

    const toggleRow = (id: number) => {
        setSelection((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
    };

    const toggleAll = (filtered: LocalData[]) => {
        setSelection((current) => (current.length === filtered.length ? [] : filtered.map((l) => l.id)));
    };

    const handleViewDetail = (local: LocalData) => {
        setSelectedId(local.id);
        openDetailDrawer();
    };

    const handleOpenEdit = (local: LocalData) => {
        setSelectedId(local.id);
        editForm.clearErrors();
        editForm.setData(toLocalForm(local));
        openEditModal();
    };

    const handleOpenCreate = () => {
        createForm.clearErrors();
        createForm.setData(EMPTY_LOCAL);
        openCreateModal();
    };

    const handleCreateLocal = () => {
        createForm.transform((data) =>
            data.status === 'Ocupado'
                ? data
                : { ...data, tenantName: '', tenantMail: '', tenantPhone: '', contractEnd: '' }
        );
        createForm.submit(LocalController.store(), {
            preserveScroll: true,
            onSuccess: () => {
                closeCreateModal();
                createForm.reset();
            },
        });
    };

    const handleSaveEdit = () => {
        if (!selectedLocal) return;
        editForm.submit(LocalController.update(selectedLocal.id), {
            preserveScroll: true,
            onSuccess: () => closeEditModal(),
        });
    };

    const handleMarkAsAvailable = () => {
        router.patch(
            LocalController.updateStatus(),
            { ids: selection, status: 'Disponible' },
            { preserveScroll: true, onSuccess: () => setSelection([]) }
        );
    };

    const handleDeleteSingle = (local: LocalData) => {
        if (!window.confirm(`¿Eliminar el local ${local.code}? Esta acción no se puede deshacer.`)) return;
        router.delete(LocalController.destroy(local.id), {
            preserveScroll: true,
            onSuccess: () => setSelection((prev) => prev.filter((id) => id !== local.id)),
        });
    };

    const handleDeleteSelected = () => {
        if (!window.confirm(`¿Eliminar ${selection.length} locales? Esta acción no se puede deshacer.`)) return;
        router.delete(LocalController.destroyMany(), {
            data: { ids: selection },
            preserveScroll: true,
            onSuccess: () => setSelection([]),
        });
    };

    return {
        selection,
        setSelection,
        toggleRow,
        toggleAll,
        selectedId,
        selectedLocal,
        createModalOpened,
        openCreateModal,
        closeCreateModal,
        detailDrawerOpened,
        openDetailDrawer,
        closeDetailDrawer,
        editModalOpened,
        openEditModal,
        closeEditModal,
        createForm,
        editForm,
        handleViewDetail,
        handleOpenEdit,
        handleOpenCreate,
        handleCreateLocal,
        handleSaveEdit,
        handleMarkAsAvailable,
        handleDeleteSingle,
        handleDeleteSelected,
    };
};
