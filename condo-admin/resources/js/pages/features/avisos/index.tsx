import { Badge, Button, Grid, Group, Stack, Switch, Text, TextInput, Textarea } from '@mantine/core';
import { Head } from '@inertiajs/react';
import { IconBell, IconCalendar, IconEye, IconPencil, IconPin, IconPlus, IconTrash, IconUser } from '@tabler/icons-react';

import { PageLayout } from '@/layouts/sections/page-layout';
import { FilterBar } from '@/layouts/sections/filter-bar';
import { DataTable, type Column } from '@/layouts/sections/data-table';
import { RowActions } from '@/layouts/sections/row-actions';
import { BulkActions } from '@/layouts/sections/bulk-actions';
import { FormModal } from '@/layouts/sections/form-modal';
import { DetailCard, DetailDrawer, DetailSection, DetailStatus } from '@/layouts/sections/detail-drawer';

import type { AvisoData } from '@/types/avisos.types';
import { DIRIGIDO_COLOR, DIRIGIDO_OPTIONS, TIPO_COLOR, TIPO_OPTIONS, formatDateTime } from '@/pages/features/avisos/constants/avisos.constants';
import { useAvisosFilters } from '@/pages/features/avisos/hooks/useAvisosFilters';
import { useAvisosActions } from '@/pages/features/avisos/hooks/useAvisosActions';

const ESTADO_OPTIONS = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
    { value: 'vigente', label: 'Vigente' },
    { value: 'expirado', label: 'Expirado' },
];

export default function AvisosList({ avisos }: { avisos: AvisoData[] }) {
    const filters = useAvisosFilters(avisos);
    const actions = useAvisosActions(avisos);

    const columns: Column<AvisoData>[] = [
        {
            header: 'Aviso',
            render: (a) => (
                <Stack gap={2}>
                    <Group gap="xs">
                        {a.fijado && <IconPin size={14} color="var(--mantine-color-orange-6)" />}
                        <Text fw={600} size="sm" lineClamp={1}>
                            {a.titulo}
                        </Text>
                    </Group>
                    <Text size="xs" c="dimmed" lineClamp={1}>
                        {a.contenido}
                    </Text>
                </Stack>
            ),
        },
        {
            header: 'Tipo',
            render: (a) => (
                <Badge color={TIPO_COLOR[a.tipo]} variant="light">
                    {TIPO_OPTIONS.find((t) => t.value === a.tipo)?.label ?? a.tipo}
                </Badge>
            ),
        },
        {
            header: 'Dirigido a',
            render: (a) => (
                <Badge color={DIRIGIDO_COLOR[a.dirigidoA]} variant="outline">
                    {DIRIGIDO_OPTIONS.find((d) => d.value === a.dirigidoA)?.label ?? a.dirigidoA}
                </Badge>
            ),
        },
        {
            header: 'Publicación',
            render: (a) => <Text size="sm">{formatDateTime(a.fechaPublicacion)}</Text>,
        },
        {
            header: 'Expiración',
            render: (a) => <Text size="sm">{formatDateTime(a.fechaExpiracion)}</Text>,
        },
        {
            header: 'Estado',
            align: 'center',
            render: (a) => (
                <Group gap="xs" justify="center">
                    <Badge color={a.activo ? 'green' : 'red'}>{a.activo ? 'Activo' : 'Inactivo'}</Badge>
                    <Badge color={a.vigente ? 'blue' : 'gray'} variant="light">
                        {a.vigente ? 'Vigente' : 'Expirado'}
                    </Badge>
                </Group>
            ),
        },
    ];

    return (
        <>
            <Head title="Avisos" />
            <PageLayout
                title="Gestión de Avisos"
                headTitle="Avisos"
                description="Publica, edita y administra los avisos del condominio"
                icon={IconBell}
                actions={<Button leftSection={<IconPlus size={18} />} radius="md" onClick={actions.handleOpenCreate}>Nuevo Aviso</Button>}
            >
                <FilterBar
                    search={{ value: filters.search, onChange: filters.setSearch, placeholder: 'Título, contenido, autor...' }}
                    filters={[
                        { label: 'Tipo', data: TIPO_OPTIONS, value: filters.tipo, onChange: filters.setTipo },
                        { label: 'Dirigido a', data: DIRIGIDO_OPTIONS, value: filters.dirigidoA, onChange: filters.setDirigidoA },
                        { label: 'Estado', data: ESTADO_OPTIONS, value: filters.estado, onChange: filters.setEstado },
                    ]}
                />

                <DataTable
                    data={filters.filteredAvisos}
                    columns={columns}
                    selection={actions.selection}
                    onSelectionChange={actions.setSelection}
                    emptyMessage="No se encontraron avisos con los filtros seleccionados."
                    actions={(aviso) => (
                        <RowActions
                            onView={() => actions.handleViewDetail(aviso)}
                            onEdit={() => actions.handleOpenEdit(aviso)}
                            onDelete={() => actions.handleDelete(aviso)}
                        />
                    )}
                />

                <BulkActions
                    count={actions.selection.length}
                    onClear={() => actions.setSelection([])}
                    actions={[
                        { label: 'Eliminar', icon: IconTrash, color: 'red', onClick: actions.handleDeleteSelected },
                        { label: 'Activar', color: 'green', onClick: () => actions.handleToggleActive(actions.selection, true) },
                        { label: 'Desactivar', color: 'orange', onClick: () => actions.handleToggleActive(actions.selection, false) },
                        {
                            label: 'Editar',
                            icon: IconPencil,
                            color: 'yellow',
                            disabled: actions.selection.length !== 1,
                            onClick: () => {
                                const selected = avisos.find((a) => a.id === actions.selection[0]);
                                if (selected) actions.handleOpenEdit(selected);
                            },
                        },
                    ]}
                />

                <FormModal
                    opened={actions.formOpened}
                    onClose={actions.closeForm}
                    isEdit={actions.editingId !== null}
                    title={actions.editingId === null ? 'Publicar Nuevo Aviso' : 'Editar Aviso'}
                    submitLabel={actions.editingId === null ? 'Publicar Aviso' : 'Actualizar Aviso'}
                    onSubmit={actions.handleSubmit}
                    loading={actions.form.processing}
                >
                    <Stack gap="md">
                        <Grid gap="md">
                            <Grid.Col span={12}>
                                <TextInput
                                    label="Título"
                                    required
                                    value={actions.form.data.titulo}
                                    error={actions.form.errors.titulo}
                                    onChange={(e) => actions.form.setData('titulo', e.currentTarget.value)}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <select
                                    className="mantine-Select-input"
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                                    value={actions.form.data.tipo}
                                    onChange={(e) => actions.form.setData('tipo', e.currentTarget.value as any)}
                                >
                                    {TIPO_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <Text size="xs" mt={4}>
                                    Tipo
                                </Text>
                                {actions.form.errors.tipo && (
                                    <Text size="xs" c="red">
                                        {actions.form.errors.tipo}
                                    </Text>
                                )}
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <select
                                    className="mantine-Select-input"
                                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                                    value={actions.form.data.dirigidoA}
                                    onChange={(e) => actions.form.setData('dirigidoA', e.currentTarget.value as any)}
                                >
                                    {DIRIGIDO_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <Text size="xs" mt={4}>
                                    Dirigido a
                                </Text>
                                {actions.form.errors.dirigidoA && (
                                    <Text size="xs" c="red">
                                        {actions.form.errors.dirigidoA}
                                    </Text>
                                )}
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <Textarea
                                    label="Contenido"
                                    required
                                    autosize
                                    minRows={4}
                                    value={actions.form.data.contenido}
                                    error={actions.form.errors.contenido}
                                    onChange={(e) => actions.form.setData('contenido', e.currentTarget.value)}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <TextInput
                                    label="Fecha de evento"
                                    type="datetime-local"
                                    value={actions.form.data.fechaEvento}
                                    error={actions.form.errors.fechaEvento}
                                    onChange={(e) => actions.form.setData('fechaEvento', e.currentTarget.value)}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <TextInput
                                    label="Fecha de publicación"
                                    type="datetime-local"
                                    value={actions.form.data.fechaPublicacion}
                                    error={actions.form.errors.fechaPublicacion}
                                    onChange={(e) => actions.form.setData('fechaPublicacion', e.currentTarget.value)}
                                />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <TextInput
                                    label="Fecha de expiración"
                                    type="datetime-local"
                                    value={actions.form.data.fechaExpiracion}
                                    error={actions.form.errors.fechaExpiracion}
                                    onChange={(e) => actions.form.setData('fechaExpiracion', e.currentTarget.value)}
                                />
                            </Grid.Col>
                        </Grid>

                        <Group gap="lg">
                            <Switch
                                label="Fijado"
                                description="Mostrar primero en la lista"
                                checked={actions.form.data.fijado}
                                onChange={(e) => actions.form.setData('fijado', e.currentTarget.checked)}
                            />
                            <Switch
                                label="Activo"
                                description="Visible para los destinatarios"
                                checked={actions.form.data.activo}
                                onChange={(e) => actions.form.setData('activo', e.currentTarget.checked)}
                            />
                        </Group>
                    </Stack>
                </FormModal>

                <DetailDrawer
                    opened={actions.detailOpened}
                    onClose={actions.closeDetail}
                    title={actions.selectedAviso?.titulo}
                    onEdit={
                        actions.selectedAviso
                            ? () => {
                                  actions.closeDetail();
                                  actions.handleOpenEdit(actions.selectedAviso!);
                              }
                            : undefined
                    }
                    editLabel="Editar Aviso"
                >
                    {actions.selectedAviso && (
                        <>
                            <DetailStatus
                                badges={
                                    <>
                                        <Badge color={actions.selectedAviso.activo ? 'green' : 'red'}>
                                            {actions.selectedAviso.activo ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                        <Badge color={actions.selectedAviso.vigente ? 'blue' : 'gray'} variant="light">
                                            {actions.selectedAviso.vigente ? 'Vigente' : 'Expirado'}
                                        </Badge>
                                        {actions.selectedAviso.fijado && <Badge color="orange">Fijado</Badge>}
                                    </>
                                }
                            />
                            <DetailCard
                                items={[
                                    { icon: IconBell, label: 'Tipo', value: TIPO_OPTIONS.find((t) => t.value === actions.selectedAviso!.tipo)?.label ?? actions.selectedAviso.tipo },
                                    { icon: IconUser, label: 'Dirigido a', value: DIRIGIDO_OPTIONS.find((d) => d.value === actions.selectedAviso!.dirigidoA)?.label ?? actions.selectedAviso.dirigidoA },
                                    { icon: IconUser, label: 'Publicado por', value: actions.selectedAviso.publicadoPorNombre },
                                ]}
                            />
                            <DetailSection title="Contenido">
                                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                                    {actions.selectedAviso.contenido}
                                </Text>
                            </DetailSection>
                            <DetailSection title="Fechas">
                                <DetailCard
                                    items={[
                                        { icon: IconCalendar, label: 'Publicación', value: formatDateTime(actions.selectedAviso.fechaPublicacion) },
                                        { icon: IconCalendar, label: 'Evento', value: formatDateTime(actions.selectedAviso.fechaEvento) },
                                        { icon: IconCalendar, label: 'Expiración', value: formatDateTime(actions.selectedAviso.fechaExpiracion) },
                                    ]}
                                />
                            </DetailSection>
                        </>
                    )}
                </DetailDrawer>
            </PageLayout>
        </>
    );
}
