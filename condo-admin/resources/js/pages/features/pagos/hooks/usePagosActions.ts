import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { router, useForm } from '@inertiajs/react';
import type { EstadoPago, PagoData, PagoForm } from '@/types/pagos.types';
import { EMPTY_PAGO_FORM, toPagoForm } from '../constants/pagos.constants';

export const usePagosActions = (pagos: PagoData[]) => {
    const [selection, setSelection] = useState<number[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false);
    const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);

    const form = useForm<PagoForm>(EMPTY_PAGO_FORM);
    const selectedPago = pagos.find((p) => p.id === selectedId) ?? null;

    const handleOpenCreate = () => {
        setEditingId(null);
        form.clearErrors();
        form.setData(EMPTY_PAGO_FORM);
        openForm();
    };

    const handleOpenEdit = (pago: PagoData) => {
        setEditingId(pago.id);
        form.clearErrors();
        form.setData(toPagoForm(pago));
        openForm();
    };

    const handleViewDetail = (pago: PagoData) => {
        setSelectedId(pago.id);
        openDetail();
    };

    const handleSubmit = () => {
        form.transform((data) => ({
            ...data,
            localId: Number(data.localId),
            residenteId: data.residenteId ? Number(data.residenteId) : null,
            monto: Number(data.monto),
        } as never));

        if (editingId === null) {
            form.post('/pagos', {
                preserveScroll: true,
                onSuccess: () => {
                    closeForm();
                    form.reset();
                },
            });
        } else {
            form.put(`/pagos/${editingId}`, {
                preserveScroll: true,
                onSuccess: () => {
                    closeForm();
                },
            });
        }
    };

    const handleValidate = (pago: PagoData) => {
        router.patch(
            '/pagos/estado',
            { ids: [pago.id], estado: 'validado' },
            { preserveScroll: true }
        );
    };

    const handleReject = (pago: PagoData) => {
        const motivo = window.prompt('Ingrese el motivo de rechazo del pago:') ?? '';
        router.patch(
            '/pagos/estado',
            { ids: [pago.id], estado: 'rechazado', motivoRechazo: motivo },
            { preserveScroll: true }
        );
    };

    const handleValidateSelected = () => {
        if (!window.confirm(`¿Validar los ${selection.length} pagos seleccionados?`)) return;
        router.patch(
            '/pagos/estado',
            { ids: selection, estado: 'validado' },
            { preserveScroll: true, onSuccess: () => setSelection([]) }
        );
    };

    const handleDelete = (pago: PagoData) => {
        if (!window.confirm(`¿Eliminar el pago #${pago.id} de ${pago.localCodigo}? Esta acción no se puede deshacer.`)) {
            return;
        }
        router.delete(`/pagos/${pago.id}`, {
            preserveScroll: true,
            onSuccess: () => setSelection((prev) => prev.filter((id) => id !== pago.id)),
        });
    };

    const handleDeleteSelected = () => {
        if (!window.confirm(`¿Eliminar los ${selection.length} pagos seleccionados? Esta acción no se puede deshacer.`)) {
            return;
        }
        router.delete('/pagos', {
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
        selectedPago,
        form,
        handleOpenCreate,
        handleOpenEdit,
        handleViewDetail,
        handleSubmit,
        handleValidate,
        handleReject,
        handleValidateSelected,
        handleDelete,
        handleDeleteSelected,
    };
};

