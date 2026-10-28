import { useMemo } from 'react';
import { Badge, Box, Button, Card, Grid, Group, Select, SimpleGrid, Stack, Switch, Text, TextInput, ThemeIcon, Title } from '@mantine/core';
import { Head } from '@inertiajs/react';
import {
    IconAlertCircle,
    IconAlertTriangle,
    IconBuildingStore,
    IconCalendar,
    IconCheck,
    IconClock,
    IconFileCertificate,
    IconFileText,
    IconMail,
    IconPencil,
    IconPhone,
    IconPlus,
    IconTrash,
    IconUser,
} from '@tabler/icons-react';

import { PageLayout } from '@/layouts/sections/page-layout';
import { FilterBar } from '@/layouts/sections/filter-bar';
import { DataTable, type Column } from '@/layouts/sections/data-table';
import { RowActions } from '@/layouts/sections/row-actions';
import { BulkActions } from '@/layouts/sections/bulk-actions';
import { FormModal } from '@/layouts/sections/form-modal';
import { DetailCard, DetailDrawer, DetailSection, DetailStatus } from '@/layouts/sections/detail-drawer';

import type { ContratoData, LocalOption, ResidenteOption, TipoRelacion } from '@/types/contratos.types';
import {
    ESTADO_CONTRATO_COLOR,
    ESTADO_CONTRATO_OPTIONS,
    EMPTY_CONTRATO_FORM,
    TIPO_RELACION_COLOR,
    TIPO_RELACION_OPTIONS,
    formatDate,
    getContratoEstado,
    getContratoEstadoLabel,
} from './constants/contratos.constants';
import { useContratosFilters } from './hooks/useContratosFilters';
import { useContratosActions } from './hooks/useContratosActions';

interface ContratosPageProps {
    contratos: ContratoData[];
    locales: LocalOption[];
    residentes: ResidenteOption[];
}

export default function ContratosPage({ contratos, locales, residentes }: ContratosPageProps) {
    const filters = useContratosFilters(contratos);
    const actions = useContratosActions(contratos);

    const localesOptions = useMemo(
        () => locales.map((l) => ({ value: String(l.id), label: l.label })),
        [locales]
    );

    const residentesOptions = useMemo(
        () => residentes.map((r) => ({ value: String(r.id), label: `${r.name} (${r.email})` })),
        [residentes]
    );

    const columns: Column<ContratoData>[] = [
        {
            header: 'Local',
            render: (c) => (
                <Box>
                    <Group gap="xs">
                        <Badge variant="outline" color="blue" fw={700}>
                            {c.localCodigo}
                        </Badge>
                        <Text fw={600} size="sm">
                            {c.localNombre}
                        </Text>
                    </Group>
                </Box>
            ),
        },
        {
            header: 'Residente',
            render: (c) => (
                <Box>
                    <Text fw={600} size="sm">
                        {c.residenteNombre}
                    </Text>
                    <Text size="xs" c="dimmed">
                        {c.residenteEmail}
                    </Text>
                </Box>
            ),
        },
        {
            header: 'Relación',
            align: 'center',
            render: (c) => (
                <Badge color={TIPO_RELACION_COLOR[c.tipoRelacion]} variant="light">
                    {c.tipoRelacion.charAt(0).toUpperCase() + c.tipoRelacion.slice(1)}
                </Badge>
            ),
        },
        {
            header: 'Vigencia',
            render: (c) => (
                <Box>
                    <Text size="sm">
                        {formatDate(c.fechaInicio)} — {c.fechaFin ? formatDate(c.fechaFin) : 'Indefinido'}
                    </Text>
                </Box>
            ),
        },
        {
            header: 'Estado',
            align: 'center',
            render: (c) => {
                const estado = getContratoEstado(c);
                return (
                    <Badge color={ESTADO_CONTRATO_COLOR[estado]} variant="filled">
                        {getContratoEstadoLabel(c)}
                    </Badge>
                );
            },
        },
        {
            header: 'Condiciones',
            align: 'center',
            render: (c) => (
                <Group gap={6} justify="center">
                    <Badge size="xs" variant="outline" color={c.habitaLocal ? 'teal' : 'gray'}>
                        {c.habitaLocal ? 'Habita' : 'No habita'}
                    </Badge>
                    <Badge size="xs" variant="outline" color={c.responsablePago ? 'blue' : 'gray'}>
                        {c.responsablePago ? 'Resp. pago' : 'No resp.'}
                    </Badge>
                </Group>
            ),
        },
    ];

    return (
        <>
            <Head title="Gestión de Contratos" />

            <PageLayout
                title="Gestión de Contratos"
                headTitle="Contratos"
                description="Control de asignación de locales, residentes, tipos de relación y vigencias contractuales"
                icon={IconFileCertificate}
                actions={
                    <Button leftSection={<IconPlus size={18} />} color="blue" radius="md" onClick={actions.handleOpenCreate}>
                        Nuevo Contrato
                    </Button>
                }
            >
                {/* Métricas / KPIs */}
                <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
                    <Card withBorder radius="md" padding="md">
                        <Group justify="space-between" align="center">
                            <Box>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                    Total Contratos
                                </Text>
                                <Title order={3} fw={700} mt={4}>
                                    {filters.stats.total}
                                </Title>
                                <Text size="xs" c="dimmed" mt={2}>
                                    Registros vinculados
                                </Text>
                            </Box>
                            <ThemeIcon color="blue" variant="light" size="xl" radius="md">
                                <IconFileText size={24} />
                            </ThemeIcon>
                        </Group>
                    </Card>

                    <Card withBorder radius="md" padding="md">
                        <Group justify="space-between" align="center">
                            <Box>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                    Vigentes
                                </Text>
                                <Title order={3} fw={700} mt={4} c="green">
                                    {filters.stats.vigentes}
                                </Title>
                                <Text size="xs" c="dimmed" mt={2}>
                                    Activos e indefinidos
                                </Text>
                            </Box>
                            <ThemeIcon color="green" variant="light" size="xl" radius="md">
                                <IconCheck size={24} />
                            </ThemeIcon>
                        </Group>
                    </Card>

                    <Card withBorder radius="md" padding="md">
                        <Group justify="space-between" align="center">
                            <Box>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                    Por Vencer
                                </Text>
                                <Title order={3} fw={700} mt={4} c="orange">
                                    {filters.stats.porVencer}
                                </Title>
                                <Text size="xs" c="dimmed" mt={2}>
                                    Vencen en ≤ 30 días
                                </Text>
                            </Box>
                            <ThemeIcon color="orange" variant="light" size="xl" radius="md">
                                <IconClock size={24} />
                            </ThemeIcon>
                        </Group>
                    </Card>

                    <Card withBorder radius="md" padding="md">
                        <Group justify="space-between" align="center">
                            <Box>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                    Vencidos
                                </Text>
                                <Title order={3} fw={700} mt={4} c="red">
                                    {filters.stats.vencidos}
                                </Title>
                                <Text size="xs" c="dimmed" mt={2}>
                                    Requieren renovación
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
                        placeholder: 'Buscar por local, residente o correo...',
                    }}
                    filters={[
                        {
                            label: 'Tipo de relación',
                            data: TIPO_RELACION_OPTIONS,
                            value: filters.tipoRelacion,
                            onChange: filters.setTipoRelacion,
                        },
                        {
                            label: 'Estado',
                            data: ESTADO_CONTRATO_OPTIONS,
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

                {/* Tabla de contratos */}
                <DataTable
                    data={filters.filteredContratos}
                    columns={columns}
                    selection={actions.selection}
                    onSelectionChange={actions.setSelection}
                    emptyMessage="No se encontraron contratos con los filtros seleccionados."
                    actions={(contrato) => (
                        <RowActions
                            onView={() => actions.handleViewDetail(contrato)}
                            onEdit={() => actions.handleOpenEdit(contrato)}
                            onDelete={() => actions.handleDelete(contrato)}
                        />
                    )}
                />

                {/* Acciones masivas */}
                <BulkActions
                    count={actions.selection.length}
                    onClear={() => actions.setSelection([])}
                    itemName="contratos"
                    actions={[
                        {
                            label: 'Eliminar',
                            icon: IconTrash,
                            color: 'red',
                            onClick: actions.handleDeleteSelected,
                        },
                        {
                            label: 'Editar',
                            icon: IconPencil,
                            color: 'yellow',
                            disabled: actions.selection.length !== 1,
                            onClick: () => {
                                const selected = contratos.find((c) => c.id === actions.selection[0]);
                                if (selected) actions.handleOpenEdit(selected);
                            },
                        },
                    ]}
                />

                {/* Modal Crear / Editar */}
                <FormModal
                    opened={actions.formOpened}
                    onClose={actions.closeForm}
                    isEdit={actions.editingId !== null}
                    title={actions.editingId === null ? 'Registrar Nuevo Contrato' : `Editar Contrato #${actions.editingId}`}
                    submitLabel={actions.editingId === null ? 'Guardar Contrato' : 'Actualizar Contrato'}
                    onSubmit={actions.handleSubmit}
                    loading={actions.form.processing}
                >
                    <Stack gap="md">
                        <Grid gap="md">
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <Select
                                    label="Local"
                                    placeholder="Selecciona un local"
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
                                    label="Residente / Locatario"
                                    placeholder="Selecciona un usuario"
                                    required
                                    searchable
                                    data={residentesOptions}
                                    value={actions.form.data.residenteId ? String(actions.form.data.residenteId) : null}
                                    error={actions.form.errors.residenteId}
                                    onChange={(val) => actions.form.setData('residenteId', val ? Number(val) : '')}
                                />
                            </Grid.Col>

                            <Grid.Col span={{ base: 12, sm: 4 }}>
                                <Select
                                    label="Tipo de relación"
                                    required
                                    data={TIPO_RELACION_OPTIONS}
                                    value={actions.form.data.tipoRelacion}
                                    error={actions.form.errors.tipoRelacion}
                                    onChange={(val) => actions.form.setData('tipoRelacion', (val as TipoRelacion) || 'locatario')}
                                />
                            </Grid.Col>

                            <Grid.Col span={{ base: 12, sm: 4 }}>
                                <TextInput
                                    label="Fecha de inicio"
                                    type="date"
                                    required
                                    value={actions.form.data.fechaInicio}
                                    error={actions.form.errors.fechaInicio}
                                    onChange={(e) => actions.form.setData('fechaInicio', e.currentTarget.value)}
                                />
                            </Grid.Col>

                            <Grid.Col span={{ base: 12, sm: 4 }}>
                                <TextInput
                                    label="Fecha de fin"
                                    description="Opcional (indefinido si vacío)"
                                    type="date"
                                    value={actions.form.data.fechaFin}
                                    error={actions.form.errors.fechaFin}
                                    onChange={(e) => actions.form.setData('fechaFin', e.currentTarget.value)}
                                />
                            </Grid.Col>
                        </Grid>

                        <Group gap="xl" mt="xs">
                            <Switch
                                label="Habita el local"
                                description="El residente ocupa o reside físicamente en este espacio"
                                checked={actions.form.data.habitaLocal}
                                onChange={(e) => actions.form.setData('habitaLocal', e.currentTarget.checked)}
                            />

                            <Switch
                                label="Responsable de pago"
                                description="El residente es responsable directo de pagos y cuotas"
                                checked={actions.form.data.responsablePago}
                                onChange={(e) => actions.form.setData('responsablePago', e.currentTarget.checked)}
                            />
                        </Group>
                    </Stack>
                </FormModal>

                {/* Drawer de Detalle */}
                <DetailDrawer
                    opened={actions.detailOpened}
                    onClose={actions.closeDetail}
                    title={
                        actions.selectedContrato ? (
                            <Group gap="xs">
                                <Badge size="lg" color="blue" variant="filled">
                                    {actions.selectedContrato.localCodigo}
                                </Badge>
                                <Text fw={700} size="md">
                                    {actions.selectedContrato.localNombre}
                                </Text>
                            </Group>
                        ) : null
                    }
                    onEdit={
                        actions.selectedContrato
                            ? () => {
                                  actions.closeDetail();
                                  actions.handleOpenEdit(actions.selectedContrato!);
                              }
                            : undefined
                    }
                    editLabel="Editar Contrato"
                >
                    {actions.selectedContrato && (
                        <>
                            <DetailStatus
                                label="Estado del Contrato"
                                badges={
                                    <>
                                        <Badge color={TIPO_RELACION_COLOR[actions.selectedContrato.tipoRelacion]} variant="light">
                                            {actions.selectedContrato.tipoRelacion.toUpperCase()}
                                        </Badge>
                                        <Badge
                                            color={ESTADO_CONTRATO_COLOR[getContratoEstado(actions.selectedContrato)]}
                                            variant="filled"
                                        >
                                            {getContratoEstadoLabel(actions.selectedContrato)}
                                        </Badge>
                                    </>
                                }
                            />

                            <DetailSection title="Espacio Comercial">
                                <DetailCard
                                    items={[
                                        {
                                            icon: IconBuildingStore,
                                            label: 'Código y Nombre',
                                            value: `${actions.selectedContrato.localCodigo} · ${actions.selectedContrato.localNombre}`,
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
                                            value: actions.selectedContrato.residenteNombre,
                                        },
                                        {
                                            icon: IconMail,
                                            label: 'Correo electrónico',
                                            value: actions.selectedContrato.residenteEmail,
                                        },
                                        {
                                            icon: IconPhone,
                                            label: 'Teléfono de contacto',
                                            value: actions.selectedContrato.residenteTelefono ?? 'Sin teléfono registrado',
                                        },
                                    ]}
                                />
                            </DetailSection>

                            <DetailSection title="Vigencia y Temporalidad">
                                <DetailCard
                                    items={[
                                        {
                                            icon: IconCalendar,
                                            label: 'Fecha de inicio',
                                            value: formatDate(actions.selectedContrato.fechaInicio),
                                        },
                                        {
                                            icon: IconCalendar,
                                            label: 'Fecha de fin',
                                            value: actions.selectedContrato.fechaFin
                                                ? formatDate(actions.selectedContrato.fechaFin)
                                                : 'Indefinido (sin fecha de expiración)',
                                        },
                                        {
                                            icon: IconClock,
                                            label: 'Días restantes',
                                            value:
                                                actions.selectedContrato.diasRestantes === null
                                                    ? 'Sin fecha de fin'
                                                    : actions.selectedContrato.diasRestantes < 0
                                                    ? `Vencido hace ${Math.abs(actions.selectedContrato.diasRestantes)} días`
                                                    : `${actions.selectedContrato.diasRestantes} días restantes`,
                                        },
                                    ]}
                                />
                            </DetailSection>

                            <DetailSection title="Condiciones de Contrato">
                                <DetailCard
                                    items={[
                                        {
                                            icon: IconCheck,
                                            label: 'Ocupación',
                                            value: actions.selectedContrato.habitaLocal
                                                ? 'El residente habita u opera el local'
                                                : 'El residente no habita el local',
                                        },
                                        {
                                            icon: IconCheck,
                                            label: 'Responsabilidad financiera',
                                            value: actions.selectedContrato.responsablePago
                                                ? 'Responsable directo del pago de renta y cuotas'
                                                : 'No es el responsable directo de pago',
                                        },
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

