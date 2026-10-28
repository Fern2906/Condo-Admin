import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { router, useForm } from '@inertiajs/react';
import ContratoController from '@/actions/App/Http/Controllers/ContratoController';
import type { ContratoData, ContratoForm } from '@/types/contratos.types';
import { EMPTY_CONTRATO_FORM, toContratoForm } from '../constants/contratos.constants';

export const useContratosActions = (contratos: ContratoData[]) => {
    const [selection, setSelection] = useState<number[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false);
    const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);

    const form = useForm<ContratoForm>(EMPTY_CONTRATO_FORM);
    const selectedContrato = contratos.find((c) => c.id === selectedId) ?? null;

    const handleOpenCreate = () => {
        setEditingId(null);
        form.clearErrors();
        form.setData(EMPTY_CONTRATO_FORM);
        openForm();
    };

    const handleOpenEdit = (contrato: ContratoData) => {
        setEditingId(contrato.id);
        form.clearErrors();
        form.setData(toContratoForm(contrato));
        openForm();
    };

    const handleViewDetail = (contrato: ContratoData) => {
        setSelectedId(contrato.id);
        openDetail();
    };

    const handleSubmit = () => {
        form.transform((data) => ({
            ...data,
            localId: Number(data.localId),
            residenteId: Number(data.residenteId),
            fechaFin: data.fechaFin ? data.fechaFin : null,
        } as never));

        form.submit(editingId === null ? ContratoController.store() : ContratoController.update(editingId), {
            preserveScroll: true,
            onSuccess: () => {
                closeForm();
                form.reset();
            },
        });
    };

    const handleDelete = (contrato: ContratoData) => {
        if (!window.confirm(`¿Eliminar el contrato de ${contrato.residenteNombre} en el local ${contrato.localCodigo}? Esta acción no se puede deshacer.`)) {
            return;
        }
        router.delete(ContratoController.destroy(contrato.id), {
            preserveScroll: true,
            onSuccess: () => setSelection((prev) => prev.filter((id) => id !== contrato.id)),
        });
    };

    const handleDeleteSelected = () => {
        if (!window.confirm(`¿Eliminar los ${selection.length} contratos seleccionados? Esta acción no se puede deshacer.`)) {
            return;
        }
        router.delete(ContratoController.destroyMany(), {
            data: { ids: selection },
            preserveScroll: true,
            onSuccess: () => setSelection([]),
        });
    };

    return {
        selection,
        setSelection,
        formOpened,
        closeForm,
        detailOpened,
        closeDetail,
        editingId,
        selectedContrato,
        form,
        handleOpenCreate,
        handleOpenEdit,
        handleViewDetail,
        handleSubmit,
        handleDelete,
        handleDeleteSelected,
    };
};

