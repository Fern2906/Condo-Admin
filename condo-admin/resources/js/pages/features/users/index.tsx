import { Badge, Button, Grid, Stack, Switch, Text, TextInput } from '@mantine/core';
import { Head, usePage } from '@inertiajs/react';
import { IconBan, IconBuildingStore, IconMail, IconPencil, IconPhone, IconPlus, IconTrash, IconUser } from '@tabler/icons-react';

import { PageLayout } from '@/layouts/sections/page-layout';
import { FilterBar } from '@/layouts/sections/filter-bar';
import { DataTable, type Column } from '@/layouts/sections/data-table';
import { RowActions } from '@/layouts/sections/row-actions';
import { BulkActions } from '@/layouts/sections/bulk-actions';
import { FormModal } from '@/layouts/sections/form-modal';
import { DetailCard, DetailDrawer, DetailSection, DetailStatus } from '@/layouts/sections/detail-drawer';

import type { Auth } from '@/types';
import type { UserData } from '@/types/users.types';
import { LOCAL_STATUS_COLOR, STATUS_OPTIONS } from '@/pages/features/users/constants/user.constants';
import { useUserFilters } from '@/pages/features/users/hooks/useUserFilters';
import { useUserActions } from '@/pages/features/users/hooks/useUserActions';

export default function UserList({ users }: { users: UserData[] }) {
    const { auth } = usePage<{ auth: Auth }>().props;

    const filters = useUserFilters(users);
    const actions = useUserActions(users);

    const columns: Column<UserData>[] = [
        { header: 'Nombre', render: (u) => u.name },
        { header: 'Email', render: (u) => u.email },
        { header: 'Teléfono', render: (u) => u.phone ?? '—' },
        { header: 'Edificio', render: (u) => u.local?.building ?? '—' },
        { header: 'Nivel', render: (u) => u.local?.level ?? '—' },
        { header: 'Local',
            render: (u) => u.local ? `${u.local.name} (${u.local.code})` : <Text size="xs" c="dimmed" fs="italic">Sin local asignado</Text>,
        },
        { header: 'Estado Usuario', align: 'center',
            render: (u) => <Badge color={u.active ? 'green' : 'red'}>{u.active ? 'Activo' : 'Inactivo'}</Badge>,
        },
        { header: 'Estado Local', align: 'center',
            render: (u) => u.local ? <Badge color={LOCAL_STATUS_COLOR[u.local.status] ?? 'gray'} variant="light">{u.local.status}</Badge> : '—',
        },
    ];

    return (
        <>
            <Head title="Lista de usuarios" />
            <PageLayout
                title="Gestión de Usuarios"
                headTitle="Lista de usuarios"
                description="Administra los datos y estados de los locatarios"
                icon={IconUser}
                actions={<Button leftSection={<IconPlus size={18} />} radius="md" onClick={actions.handleOpenCreate}>Nuevo Usuario</Button>}
            >
                <FilterBar
                    search={{ value: filters.search, onChange: filters.setSearch, placeholder: 'Nombre, email, local...' }}
                    filters={[
                        { label: 'Estado', data: STATUS_OPTIONS, value: filters.status, onChange: filters.setStatus },
                        { label: 'Edificio', data: filters.buildingData, value: filters.building, onChange: filters.setBuilding },
                    ]}
                />

                <DataTable
                    data={filters.filteredUsers}
                    columns={columns}
                    selection={actions.selection}
                    onSelectionChange={actions.setSelection}
                    emptyMessage="No se encontraron usuarios con los filtros seleccionados."
                    actions={(user) => (
                        <RowActions
                            onView={() => actions.handleViewDetail(user)}
                            onEdit={() => actions.handleOpenEdit(user)}
                            onDelete={() => actions.handleDelete(user)}
                            deleteDisabled={user.id === auth.user.id}
                        />
                    )}
                />

                <BulkActions
                    count={actions.selection.length}
                    onClear={() => actions.setSelection([])}
                    actions={[
                        { label: 'Eliminar', icon: IconTrash, color: 'red', onClick: actions.handleDeleteSelected },
                        {
                            label: 'Editar',
                            icon: IconPencil,
                            color: 'yellow',
                            disabled: actions.selection.length !== 1,
                            onClick: () => {
                                const selected = users.find((u) => u.id === actions.selection[0]);
                                if (selected) actions.handleOpenEdit(selected);
                            },
                        },
                        { label: 'Bloquear', icon: IconBan, onClick: actions.handleBlockSelected },
                    ]}
                />

                <FormModal
                    opened={actions.formOpened}
                    onClose={actions.closeForm}
                    isEdit={actions.editingId !== null}
                    title={actions.editingId === null ? 'Registrar Nuevo Usuario' : 'Editar Usuario'}
                    submitLabel={actions.editingId === null ? 'Guardar Usuario' : 'Actualizar Usuario'}
                    onSubmit={actions.handleSubmit}
                    loading={actions.form.processing}
                >
                    <Stack gap="md">
                        <Grid gap="md">
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <TextInput
                                    label="Nombre completo"
                                    required
                                    value={actions.form.data.name}
                                    error={actions.form.errors.name}
                                    onChange={(e) => actions.form.setData('name', e.currentTarget.value)}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <TextInput
                                    label="Correo electrónico"
                                    type="email"
                                    required
                                    value={actions.form.data.email}
                                    error={actions.form.errors.email}
                                    onChange={(e) => actions.form.setData('email', e.currentTarget.value)}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 4 }}>
                                <TextInput
                                    label="Teléfono"
                                    placeholder="+52 ..."
                                    value={actions.form.data.phone}
                                    error={actions.form.errors.phone}
                                    onChange={(e) => actions.form.setData('phone', e.currentTarget.value)}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 4 }}>
                                <TextInput
                                    label="Teléfono alterno"
                                    value={actions.form.data.altPhone}
                                    error={actions.form.errors.altPhone}
                                    onChange={(e) => actions.form.setData('altPhone', e.currentTarget.value)}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 4 }}>
                                <TextInput
                                    label="RFC"
                                    value={actions.form.data.rfc}
                                    error={actions.form.errors.rfc}
                                    onChange={(e) => actions.form.setData('rfc', e.currentTarget.value.toUpperCase())}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <TextInput
                                    label="Contacto de emergencia"
                                    value={actions.form.data.emergencyContact}
                                    error={actions.form.errors.emergencyContact}
                                    onChange={(e) => actions.form.setData('emergencyContact', e.currentTarget.value)}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <TextInput
                                    label="Teléfono de emergencia"
                                    value={actions.form.data.emergencyPhone}
                                    error={actions.form.errors.emergencyPhone}
                                    onChange={(e) => actions.form.setData('emergencyPhone', e.currentTarget.value)}
                                />
                            </Grid.Col>
                        </Grid>

                        <Switch
                            label="Usuario activo"
                            description="Un usuario inactivo (bloqueado) no puede iniciar sesión."
                            checked={actions.form.data.active}
                            disabled={actions.editingId === auth.user.id}
                            onChange={(e) => actions.form.setData('active', e.currentTarget.checked)}
                        />
                    </Stack>
                </FormModal>

                <DetailDrawer
                    opened={actions.detailOpened}
                    onClose={actions.closeDetail}
                    title={actions.selectedUser?.name}
                    onEdit={
                        actions.selectedUser
                            ? () => {
                                  actions.closeDetail();
                                  actions.handleOpenEdit(actions.selectedUser!);
                              }
                            : undefined
                    }
                    editLabel="Editar Usuario"
                >
                    {actions.selectedUser && (
                        <>
                            <DetailStatus
                                badges={
                                    <>
                                        <Badge color={actions.selectedUser.active ? 'green' : 'red'}>
                                            {actions.selectedUser.active ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                        {!actions.selectedUser.verified && <Badge color="gray" variant="light">Correo sin verificar</Badge>}
                                    </>
                                }
                            />
                            <DetailCard
                                items={[
                                    { icon: IconMail, label: 'Correo electrónico', value: actions.selectedUser.email },
                                    { icon: IconPhone, label: 'Teléfono / alterno', value: `${actions.selectedUser.phone ?? '—'} / ${actions.selectedUser.altPhone ?? '—'}` },
                                    {
                                        icon: IconUser,
                                        label: 'Contacto de emergencia',
                                        value: `${actions.selectedUser.emergencyContact ?? '—'} ${actions.selectedUser.emergencyPhone ? `(${actions.selectedUser.emergencyPhone})` : ''}`,
                                    },
                                    { label: 'RFC', value: actions.selectedUser.rfc ?? '—' },
                                ]}
                            />
                            <DetailSection title="Local">
                                {actions.selectedUser.local ? (
                                    <Stack gap="xs">
                                        <DetailCard
                                            items={[
                                                {
                                                    icon: IconBuildingStore,
                                                    label: `${actions.selectedUser.local.building} · ${actions.selectedUser.local.level}`,
                                                    value: `${actions.selectedUser.local.name} (${actions.selectedUser.local.code})`,
                                                },
                                            ]}
                                        />
                                        {actions.selectedUser.localesCount > 1 && (
                                            <Text size="xs" c="dimmed" fs="italic">
                                                Y {actions.selectedUser.localesCount - 1} locales más.
                                            </Text>
                                        )}
                                    </Stack>
                                ) : (
                                    <Text size="sm" c="dimmed" fs="italic">
                                        Sin local asignado. Se asigna desde la página de Locales.
                                    </Text>
                                )}
                            </DetailSection>
                        </>
                    )}
                </DetailDrawer>
            </PageLayout>
        </>
    );
}
