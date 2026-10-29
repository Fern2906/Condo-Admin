import { Badge, Button, Card, Grid, Group, Paper, Select, Stack, Switch, Text, TextInput, Textarea } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { Head } from '@inertiajs/react';
import { IconBell, IconCalendar, IconEye, IconPencil, IconPin, IconPlus, IconTrash, IconUser } from '@tabler/icons-react';

import { PageLayout } from '@/layouts/sections/page-layout';
import { FilterBar } from '@/layouts/sections/filter-bar';
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

interface AvisosListProps {
    avisos: AvisoData[];
    isAdmin?: boolean;
}

export default function AvisosList({ avisos, isAdmin = true }: Readonly<AvisosListProps>) {
    const filters = useAvisosFilters(avisos);
    const actions = useAvisosActions(avisos);

    const parseStringToDate = (value?: string | null): Date | null => {
    if (!value) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
    };

    const parseDateToString = (date: Date | string | null): string => {
        if (!date) return '';
        if (typeof date === 'string') return date;
        return date.toISOString();
    };

    return (
        <>
            <Head title="Avisos" />
            <PageLayout
                title="Avisos"
                headTitle="Avisos"
                description="Comunicados y novedades importantes"
                icon={IconBell}
                actions={
                    isAdmin ? (
                        <Button
                            leftSection={<IconPlus size={18} />}
                            radius="md"
                            onClick={actions.handleOpenCreate}
                        >
                            Nuevo Aviso
                        </Button>
                    ) : undefined
                }
            >
                <FilterBar
                    search={{
                        value: filters.search,
                        onChange: filters.setSearch,
                        placeholder: 'Buscar en avisos...',
                    }}
                    filters={[
                        { label: 'Tipo', data: TIPO_OPTIONS, value: filters.tipo, onChange: filters.setTipo },
                        { label: 'Dirigido a', data: DIRIGIDO_OPTIONS, value: filters.dirigidoA, onChange: filters.setDirigidoA },
                        { label: 'Estado', data: ESTADO_OPTIONS, value: filters.estado, onChange: filters.setEstado },
                    ]}
                />

                {filters.filteredAvisos.length === 0 ? (
                    <Paper p="xl" radius="md" withBorder style={{ textAlign: 'center' }}>
                        <Text c="dimmed">No se encontraron avisos con los filtros seleccionados.</Text>
                    </Paper>
                ) : (
                    <Grid g="md">
                        {filters.filteredAvisos.map((aviso) => {
                            const isSelected = actions.selection.includes(aviso.id);

                            return (
                                <Grid.Col key={aviso.id} span={{ base: 12, sm: 6, lg: 4 }}>
                                    <Card
                                        shadow="sm"
                                        padding="lg"
                                        radius="md"
                                        withBorder
                                        style={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justify: 'space-between',
                                            borderColor: isSelected ? 'var(--mantine-color-blue-6)' : undefined,
                                            borderWidth: aviso.fijado ? '2px' : '1px',
                                        }}
                                    >
                                        <Stack gap="xs">
                                            <Group justify="space-between" align="flex-start" wrap="nowrap">
                                                <Group gap={6} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                                                    {aviso.fijado && (
                                                        <IconPin
                                                            size={18}
                                                            color="var(--mantine-color-orange-6)"
                                                            style={{ flexShrink: 0 }}
                                                        />
                                                    )}
                                                    <Text fw={600} size="md" lineClamp={1}>
                                                        {aviso.titulo}
                                                    </Text>
                                                </Group>
                                                {isAdmin && (
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={(e) => {
                                                            const newSelection = e.target.checked
                                                                ? [...actions.selection, aviso.id]
                                                                : actions.selection.filter((id) => id !== aviso.id);
                                                            actions.setSelection(newSelection);
                                                        }}
                                                    />
                                                )}
                                            </Group>

                                            <Group gap="xs">
                                                <Badge color={TIPO_COLOR[aviso.tipo]} variant="light" size="sm">
                                                    {TIPO_OPTIONS.find((t) => t.value === aviso.tipo)?.label ?? aviso.tipo}
                                                </Badge>
                                                <Badge color={DIRIGIDO_COLOR[aviso.dirigidoA]} variant="outline" size="sm">
                                                    {DIRIGIDO_OPTIONS.find((d) => d.value === aviso.dirigidoA)?.label ?? aviso.dirigidoA}
                                                </Badge>
                                            </Group>

                                            <Text size="sm" c="dimmed" lineClamp={3} my={4}>
                                                {aviso.contenido}
                                            </Text>
                                        </Stack>

                                        <Stack gap="xs" mt="md">
                                            <Group justify="space-between" align="center">
                                                <Group gap={4}>
                                                    <IconCalendar size={14} color="var(--mantine-color-dimmed)" />
                                                    <Text size="xs" c="dimmed">
                                                        {formatDateTime(aviso.fechaPublicacion)}
                                                    </Text>
                                                </Group>
                                                {isAdmin && (
                                                    <Badge size="xs" color={aviso.activo ? 'green' : 'red'}>
                                                        {aviso.activo ? 'Activo' : 'Inactivo'}
                                                    </Badge>
                                                )}
                                            </Group>

                                            <Group gap="xs" justify="flex-end" pt="xs" style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}>
                                                <Button
                                                    size="xs"
                                                    variant="light"
                                                    leftSection={<IconEye size={14} />}
                                                    onClick={() => actions.handleViewDetail(aviso)}
                                                >
                                                    Ver detalle
                                                </Button>
                                                {isAdmin && (
                                                    <>
                                                        <Button
                                                            size="xs"
                                                            variant="subtle"
                                                            color="blue"
                                                            leftSection={<IconPencil size={14} />}
                                                            onClick={() => actions.handleOpenEdit(aviso)}
                                                        >
                                                            Editar
                                                        </Button>
                                                        <Button
                                                            size="xs"
                                                            variant="subtle"
                                                            color="red"
                                                            leftSection={<IconTrash size={14} />}
                                                            onClick={() => actions.handleDelete(aviso)}
                                                        >
                                                            Eliminar
                                                        </Button>
                                                    </>
                                                )}
                                            </Group>
                                        </Stack>
                                    </Card>
                                </Grid.Col>
                            );
                        })}
                    </Grid>
                )}

                {isAdmin && (
                    <BulkActions
                        count={actions.selection.length}
                        onClear={() => actions.setSelection([])}
                        actions={[
                            { label: 'Eliminar', icon: IconTrash, color: 'red', onClick: actions.handleDeleteSelected },
                            {
                                label: 'Activar', color: 'green', onClick: () => actions.handleToggleActive(actions.selection, true),
                                icon: undefined
                            },
                            {
                                label: 'Desactivar', color: 'orange', onClick: () => actions.handleToggleActive(actions.selection, false),
                                icon: undefined
                            },
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
                )}

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
                                <Select
                                    label="Tipo"
                                    data={TIPO_OPTIONS}
                                    value={actions.form.data.tipo}
                                    error={actions.form.errors.tipo}
                                    onChange={(val) => actions.form.setData('tipo', val as AvisoData['tipo'])}
                                    allowDeselect={false}
                                    required
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <Select
                                    label="Dirigido a"
                                    data={DIRIGIDO_OPTIONS}
                                    value={actions.form.data.dirigidoA}
                                    error={actions.form.errors.dirigidoA}
                                    onChange={(val) => actions.form.setData('dirigidoA', val as AvisoData['dirigidoA'])}
                                    allowDeselect={false}
                                    required
                                />
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
                                <DateTimePicker
                                    label="Fecha de evento"
                                    value={parseStringToDate(actions.form.data.fechaEvento)}
                                    error={actions.form.errors.fechaEvento}
                                    onChange={(date) => actions.form.setData('fechaEvento', parseDateToString(date))}
                                    leftSection={<IconCalendar size={16} />}
                                    valueFormat="DD/MM/YYYY HH:mm"
                                    clearable
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <DateTimePicker
                                    label="Fecha de publicación"
                                    value={parseStringToDate(actions.form.data.fechaPublicacion)}
                                    error={actions.form.errors.fechaPublicacion}
                                    onChange={(date) => actions.form.setData('fechaPublicacion', parseDateToString(date))}
                                    leftSection={<IconCalendar size={16} />}
                                    valueFormat="DD/MM/YYYY HH:mm"
                                    clearable
                                />
                            </Grid.Col>
                            <Grid.Col span={12}>
                                <DateTimePicker
                                    label="Fecha de expiración"
                                    value={parseStringToDate(actions.form.data.fechaExpiracion)}
                                    error={actions.form.errors.fechaExpiracion}
                                    onChange={(date) => actions.form.setData('fechaExpiracion', parseDateToString(date))}
                                    leftSection={<IconCalendar size={16} />}
                                    valueFormat="DD/MM/YYYY HH:mm"
                                    clearable
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
                        isAdmin && actions.selectedAviso
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
