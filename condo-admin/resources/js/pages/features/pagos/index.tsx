import { useMemo } from 'react';
import {
    ActionIcon,
    Anchor,
    Badge,
    Box,
    Button,
    Card,
    Grid,
    Group,
    Menu,
    NumberInput,
    Select,
    SimpleGrid,
    Stack,
    Text,
    TextInput,
    Textarea,
    ThemeIcon,
    Title,
} from '@mantine/core';
import { Head } from '@inertiajs/react';
import {
    IconAlertTriangle,
    IconBuildingStore,
    IconCalendar,
    IconCash,
    IconCheck,
    IconClock,
    IconDotsVertical,
    IconEye,
    IconFileText,
    IconMail,
    IconPencil,
    IconPlus,
    IconReceipt,
    IconReceiptTax,
    IconTrash,
    IconUser,
    IconX,
} from '@tabler/icons-react';

import { PageLayout } from '@/layouts/sections/page-layout';
import { FilterBar } from '@/layouts/sections/filter-bar';
import { DataTable, type Column } from '@/layouts/sections/data-table';
import { RowActions } from '@/layouts/sections/row-actions';
import { BulkActions } from '@/layouts/sections/bulk-actions';
import { FormModal } from '@/layouts/sections/form-modal';
import { DetailCard, DetailDrawer, DetailSection, DetailStatus } from '@/layouts/sections/detail-drawer';

import type { CuotaOption, EstadoPago, LocalOption, PagoData, ResidenteOption } from '@/types/pagos.types';
import {
    ESTADOS_PAGO_COLOR,
    ESTADOS_PAGO_OPTIONS,
    formatDate,
    formatMoney,
} from './constants/pagos.constants';
import { usePagosFilters } from './hooks/usePagosFilters';
import { usePagosActions } from './hooks/usePagosActions';

interface PagosPageProps {
    pagos: PagoData[];
    locales: LocalOption[];
    residentes: ResidenteOption[];
    cuotas: CuotaOption[];
}

export default function PagosPage({ pagos, locales, residentes, cuotas }: PagosPageProps) {
    const filters = usePagosFilters(pagos);
    const actions = usePagosActions(pagos);

    const localesOptions = useMemo(
        () => locales.map((l) => ({ value: String(l.id), label: l.label })),
        [locales]
    );

    const residentesOptions = useMemo(
        () => residentes.map((r) => ({ value: String(r.id), label: `${r.name} (${r.email})` })),
        [residentes]
    );

    const columns: Column<PagoData>[] = [
        {
            header: 'Folio / Recibo',
            render: (p) => (
                <Box>
                    {p.reciboFolio ? (
                        <Badge variant="filled" color="green" size="sm">
                            {p.reciboFolio}
                        </Badge>
                    ) : (
                        <Badge variant="outline" color="gray" size="sm">
                            #{p.id}
                        </Badge>
                    )}
                </Box>
            ),
        },
        {
            header: 'Local',
            render: (p) => (
                <Box>
                    <Group gap="xs">
                        <Badge variant="outline" color="blue" fw={700}>
                            {p.localCodigo}
                        </Badge>
                        <Text fw={600} size="sm">
                            {p.localNombre}
                        </Text>
                    </Group>
                </Box>
            ),
        },
        {
            header: 'Residente',
            render: (p) => (
                <Box>
                    <Text fw={600} size="sm">
                        {p.residenteNombre}
                    </Text>
                    <Text size="xs" c="dimmed">
                        {p.residenteEmail}
                    </Text>
                </Box>
            ),
        },
        {
            header: 'Monto',
            render: (p) => (
                <Text fw={700} size="sm" c="blue">
                    {formatMoney(p.monto)}
                </Text>
            ),
        },
        {
            header: 'Fecha Pago',
            render: (p) => <Text size="sm">{formatDate(p.fechaPago)}</Text>,
        },
        {
            header: 'Estado',
            align: 'center',
            render: (p) => (
                <Badge color={ESTADOS_PAGO_COLOR[p.estado]} variant="light">
                    {p.estado.charAt(0).toUpperCase() + p.estado.slice(1)}
                </Badge>
            ),
        },
    ];

    return (
        <>
            <Head title="Gestión de Cuotas y Pagos" />

            <PageLayout
                title="Gestión de Cuotas y Pagos"
                headTitle="Pagos y Cuotas"
                description="Control de ingresos, cobros de mantenimiento, cuotas y validación de comprobantes"
                icon={IconReceiptTax}
                actions={
                    <Button leftSection={<IconPlus size={18} />} color="blue" radius="md" onClick={actions.handleOpenCreate}>
                        Registrar Pago
                    </Button>
                }
            >
                {/* Métricas KPI */}
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
                    <Card withBorder radius="md" padding="md">
                        <Group justify="space-between" align="center">
                            <Box>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                    Total Recaudado
                                </Text>
                                <Title order={3} fw={700} mt={4} c="green">
                                    {formatMoney(filters.stats.montoValidados)}
                                </Title>
                                <Text size="xs" c="dimmed" mt={2}>
                                    {filters.stats.validados} pagos validados
                                </Text>
                            </Box>
                            <ThemeIcon color="green" variant="light" size="xl" radius="md">
                                <IconCash size={24} />
                            </ThemeIcon>
                        </Group>
                    </Card>

                    <Card withBorder radius="md" padding="md">
                        <Group justify="space-between" align="center">
                            <Box>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                    Por Validar
                                </Text>
                                <Title order={3} fw={700} mt={4} c="yellow">
                                    {formatMoney(filters.stats.montoPendientes)}
                                </Title>
                                <Text size="xs" c="dimmed" mt={2}>
                                    {filters.stats.pendientes} pendientes de revisión
                                </Text>
                            </Box>
                            <ThemeIcon color="yellow" variant="light" size="xl" radius="md">
                                <IconClock size={24} />
                            </ThemeIcon>
                        </Group>
                    </Card>

                    <Card withBorder radius="md" padding="md">
                        <Group justify="space-between" align="center">
                            <Box>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                    Total Registros
                                </Text>
                                <Title order={3} fw={700} mt={4} c="blue">
                                    {filters.stats.total}
                                </Title>
                                <Text size="xs" c="dimmed" mt={2}>
                                    Pagos en historial
                                </Text>
                            </Box>
                            <ThemeIcon color="blue" variant="light" size="xl" radius="md">
                                <IconReceiptTax size={24} />
                            </ThemeIcon>
                        </Group>
                    </Card>

                    <Card withBorder radius="md" padding="md">
                        <Group justify="space-between" align="center">
                            <Box>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                    Rechazados
                                </Text>
                                <Title order={3} fw={700} mt={4} c="red">
                                    {filters.stats.rechazados}
                                </Title>
                                <Text size="xs" c="dimmed" mt={2}>
                                    Comprobantes no aprobados
                                </Text>
                            </Box>
                            <ThemeIcon color="red" variant="light" size="xl" radius="md">
                                <IconAlertTriangle size={24} />
                            </ThemeIcon>
                        </Group>
                    </Card>
                </SimpleGrid>

                {/* Filtros */}
                <FilterBar
                    search={{
                        value: filters.search,
                        onChange: filters.setSearch,
                        placeholder: 'Buscar por local, residente, folio o notas...',
                    }}
                    filters={[
                        {
                            label: 'Estado',
                            data: ESTADOS_PAGO_OPTIONS,
                            value: filters.estado,
                            onChange: filters.setEstado,
                        },
                        {
                            label: 'Local',
                            data: filters.localOptions,
                            value: filters.local,
                            onChange: filters.setLocal,
                            searchable: true,
                        },
                    ]}
                />

                {/* Tabla de pagos */}
                <DataTable
                    data={filters.filteredPagos}
                    columns={columns}
                    selection={actions.selection}
                    onSelectionChange={actions.setSelection}
                    emptyMessage="No se encontraron pagos con los filtros seleccionados."
                    actions={(pago) => (
                        <RowActions
                            onView={() => actions.handleViewDetail(pago)}
                            onEdit={() => actions.handleOpenEdit(pago)}
                            onDelete={() => actions.handleDelete(pago)}
                            menuItems={
                                <>
                                    {pago.estado !== 'validado' && (
                                        <Menu.Item
                                            color="green"
                                            leftSection={<IconCheck size={14} />}
                                            onClick={() => actions.handleValidate(pago)}
                                        >
                                            Validar y emitir recibo
                                        </Menu.Item>
                                    )}
                                    {pago.estado !== 'rechazado' && (
                                        <Menu.Item
                                            color="orange"
                                            leftSection={<IconX size={14} />}
                                            onClick={() => actions.handleReject(pago)}
                                        >
                                            Rechazar pago
                                        </Menu.Item>
                                    )}
                                </>
                            }
                        />
                    )}
                />

                {/* Acciones masivas */}
                <BulkActions
                    count={actions.selection.length}
                    onClear={() => actions.setSelection([])}
                    itemName="pagos"
                    actions={[
                        {
                            label: 'Validar',
                            icon: IconCheck,
                            color: 'green',
                            onClick: actions.handleValidateSelected,
                        },
                        {
                            label: 'Eliminar',
                            icon: IconTrash,
                            color: 'red',
                            onClick: actions.handleDeleteSelected,
                        },
                    ]}
                />

                {/* Modal Crear / Editar */}
                <FormModal
                    opened={actions.formOpened}
                    onClose={actions.closeForm}
                    isEdit={actions.editingId !== null}
                    title={actions.editingId === null ? 'Registrar Nuevo Pago' : `Editar Pago #${actions.editingId}`}
                    submitLabel={actions.editingId === null ? 'Guardar Pago' : 'Actualizar Pago'}
                    onSubmit={actions.handleSubmit}
                    loading={actions.form.processing}
                >
                    <Stack gap="md">
                        <Grid gap="md">
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <Select
                                    label="Local"
                                    placeholder="Selecciona el local"
                                    required
                                    searchable
                                    data={localesOptions}
                                    value={actions.form.data.localId ? String(actions.form.data.localId) : null}
                                    error={actions.form.errors.localId}
                                    onChange={(val) => actions.form.setData('localId', val ? Number(val) : '')}
                                />
                            </Grid.Col>

                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <Select
                                    label="Residente (Opcional)"
                                    placeholder="Selecciona el residente"
                                    clearable
                                    searchable
                                    data={residentesOptions}
                                    value={actions.form.data.residenteId ? String(actions.form.data.residenteId) : null}
                                    error={actions.form.errors.residenteId}
                                    onChange={(val) => actions.form.setData('residenteId', val ? Number(val) : '')}
                                />
                            </Grid.Col>

                            <Grid.Col span={{ base: 12, sm: 4 }}>
                                <NumberInput
                                    label="Monto ($)"
                                    required
                                    min={0.01}
                                    step={100}
                                    decimalScale={2}
                                    thousandSeparator=","
                                    value={actions.form.data.monto}
                                    error={actions.form.errors.monto}
                                    onChange={(val) => actions.form.setData('monto', val)}
                                />
                            </Grid.Col>

                            <Grid.Col span={{ base: 12, sm: 4 }}>
                                <TextInput
                                    label="Fecha de Pago"
                                    type="date"
                                    required
                                    value={actions.form.data.fechaPago}
                                    error={actions.form.errors.fechaPago}
                                    onChange={(e) => actions.form.setData('fechaPago', e.currentTarget.value)}
                                />
                            </Grid.Col>

                            <Grid.Col span={{ base: 12, sm: 4 }}>
                                <Select
                                    label="Estado"
                                    required
                                    data={ESTADOS_PAGO_OPTIONS}
                                    value={actions.form.data.estado}
                                    error={actions.form.errors.estado}
                                    onChange={(val) => actions.form.setData('estado', (val as EstadoPago) || 'pendiente')}
                                />
                            </Grid.Col>

                            <Grid.Col span={12}>
                                <TextInput
                                    label="URL o enlace del Comprobante"
                                    placeholder="https://..."
                                    value={actions.form.data.comprobanteUrl}
                                    error={actions.form.errors.comprobanteUrl}
                                    onChange={(e) => actions.form.setData('comprobanteUrl', e.currentTarget.value)}
                                />
                            </Grid.Col>

                            <Grid.Col span={12}>
                                <Textarea
                                    label="Notas o concepto"
                                    placeholder="Ej: Pago cuota ordinaria de mantenimiento"
                                    autosize
                                    minRows={2}
                                    value={actions.form.data.notas}
                                    error={actions.form.errors.notas}
                                    onChange={(e) => actions.form.setData('notas', e.currentTarget.value)}
                                />
                            </Grid.Col>

                            {actions.form.data.estado === 'rechazado' && (
                                <Grid.Col span={12}>
                                    <TextInput
                                        label="Motivo de rechazo"
                                        placeholder="Explica por qué fue rechazado"
                                        value={actions.form.data.motivoRechazo}
                                        error={actions.form.errors.motivoRechazo}
                                        onChange={(e) => actions.form.setData('motivoRechazo', e.currentTarget.value)}
                                    />
                                </Grid.Col>
                            )}
                        </Grid>
                    </Stack>
                </FormModal>

                {/* Drawer Detalle */}
                <DetailDrawer
                    opened={actions.detailOpened}
                    onClose={actions.closeDetail}
                    title={
                        actions.selectedPago ? (
                            <Group gap="xs">
                                <Badge size="lg" color="blue" variant="filled">
                                    {actions.selectedPago.localCodigo}
                                </Badge>
                                <Text fw={700} size="md">
                                    {actions.selectedPago.reciboFolio ?? `Pago #${actions.selectedPago.id}`}
                                </Text>
                            </Group>
                        ) : null
                    }
                    onEdit={
                        actions.selectedPago
                            ? () => {
                                  actions.closeDetail();
                                  actions.handleOpenEdit(actions.selectedPago!);
                              }
                            : undefined
                    }
                    editLabel="Editar Pago"
                >
                    {actions.selectedPago && (
                        <>
                            <DetailStatus
                                label="Estado del Pago"
                                badges={
                                    <>
                                        <Badge color={ESTADOS_PAGO_COLOR[actions.selectedPago.estado]} variant="filled">
                                            {actions.selectedPago.estado.toUpperCase()}
                                        </Badge>
                                        {actions.selectedPago.reciboFolio && (
                                            <Badge color="green" variant="light">
                                                Folio: {actions.selectedPago.reciboFolio}
                                            </Badge>
                                        )}
                                    </>
                                }
                            />

                            <DetailSection title="Espacio Comercial">
                                <DetailCard
                                    items={[
                                        {
                                            icon: IconBuildingStore,
                                            label: 'Local',
                                            value: `${actions.selectedPago.localCodigo} · ${actions.selectedPago.localNombre}`,
                                        },
                                    ]}
                                />
                            </DetailSection>

                            <DetailSection title="Datos Financieros">
                                <DetailCard
                                    items={[
                                        {
                                            icon: IconCash,
                                            label: 'Monto pagado',
                                            value: formatMoney(actions.selectedPago.monto),
                                        },
                                        {
                                            icon: IconCalendar,
                                            label: 'Fecha de pago',
                                            value: formatDate(actions.selectedPago.fechaPago),
                                        },
                                        {
                                            icon: IconUser,
                                            label: 'Registrado por',
                                            value: actions.selectedPago.registradoPorNombre,
                                        },
                                        {
                                            icon: IconCheck,
                                            label: 'Validado por',
                                            value: actions.selectedPago.validadoPorNombre
                                                ? `${actions.selectedPago.validadoPorNombre} (${formatDate(actions.selectedPago.fechaValidacion)})`
                                                : 'Pendiente de validación',
                                        },
                                    ]}
                                />
                            </DetailSection>

                            <DetailSection title="Información del Residente">
                                <DetailCard
                                    items={[
                                        {
                                            icon: IconUser,
                                            label: 'Nombre completo',
                                            value: actions.selectedPago.residenteNombre,
                                        },
                                        {
                                            icon: IconMail,
                                            label: 'Correo electrónico',
                                            value: actions.selectedPago.residenteEmail || 'Sin email registrado',
                                        },
                                    ]}
                                />
                            </DetailSection>

                            {actions.selectedPago.comprobanteUrl && (
                                <DetailSection title="Comprobante">
                                    <DetailCard
                                        items={[
                                            {
                                                icon: IconFileText,
                                                label: 'Enlace al documento',
                                                value: (
                                                    <Anchor href={actions.selectedPago.comprobanteUrl} target="_blank" rel="noopener noreferrer">
                                                        Ver comprobante de pago
                                                    </Anchor>
                                                ),
                                            },
                                        ]}
                                    />
                                </DetailSection>
                            )}

                            {actions.selectedPago.notas && (
                                <DetailSection title="Notas y Concepto">
                                    <Card withBorder radius="sm" p="sm">
                                        <Text size="sm">{actions.selectedPago.notas}</Text>
                                    </Card>
                                </DetailSection>
                            )}

                            {actions.selectedPago.motivoRechazo && (
                                <DetailSection title="Motivo de Rechazo">
                                    <Card withBorder radius="sm" p="sm" bg="var(--mantine-color-red-0)">
                                        <Text size="sm" c="red">
                                            {actions.selectedPago.motivoRechazo}
                                        </Text>
                                    </Card>
                                </DetailSection>
                            )}
                        </>
                    )}
                </DetailDrawer>
            </PageLayout>
        </>
    );
}

