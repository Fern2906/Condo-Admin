import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { router, useForm } from '@inertiajs/react';
import UserController from '@/actions/App/Http/Controllers/UserController';
import type { UserData, UserForm } from '@/types/users.types';
import { EMPTY_USER_FORM, toUserForm } from '../constants/user.constants';

export const useUserActions = (users: UserData[]) => {
    const [selection, setSelection] = useState<number[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const [formOpened, { open: openForm, close: closeForm }] = useDisclosure(false);
    const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);

    const form = useForm<UserForm>(EMPTY_USER_FORM);
    const selectedUser = users.find((u) => u.id === selectedId) ?? null;

    const handleOpenCreate = () => {
        setEditingId(null);
        form.clearErrors();
        form.setData(EMPTY_USER_FORM);
        openForm();
    };

    const handleOpenEdit = (user: UserData) => {
        setEditingId(user.id);
        form.clearErrors();
        form.setData(toUserForm(user));
        openForm();
    };

    const handleViewDetail = (user: UserData) => {
        setSelectedId(user.id);
        openDetail();
    };

    const handleSubmit = () => {
        form.submit(editingId === null ? UserController.store() : UserController.update(editingId), {
            preserveScroll: true,
            onSuccess: () => {
                closeForm();
                form.reset();
            },
        });
    };

    const handleDelete = (user: UserData) => {
        if (!window.confirm(`¿Eliminar a ${user.name}? Esta acción no se puede deshacer.`)) return;
        router.delete(UserController.destroy(user.id), {
            preserveScroll: true,
            onSuccess: () => setSelection((prev) => prev.filter((id) => id !== user.id)),
        });
    };

    const handleDeleteSelected = () => {
        if (!window.confirm(`¿Eliminar ${selection.length} usuarios? Esta acción no se puede deshacer.`)) return;
        router.delete(UserController.destroyMany(), {
            data: { ids: selection },
            preserveScroll: true,
            onSuccess: () => setSelection([]),
        });
    };

    const handleBlockSelected = () => {
        router.patch(
            UserController.updateStatus(),
            { ids: selection, active: false },
            { preserveScroll: true, onSuccess: () => setSelection([]) }
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
        selectedUser,
        form,
        handleOpenCreate,
        handleOpenEdit,
        handleViewDetail,
        handleSubmit,
        handleDelete,
        handleDeleteSelected,
        handleBlockSelected,
    };
};
