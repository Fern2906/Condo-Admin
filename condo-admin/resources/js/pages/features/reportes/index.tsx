import {
    Badge,
    Box,
    Button,
    Card,
    Center,
    Grid,
    Group,
    Progress,
    RingProgress,
    SimpleGrid,
    Stack,
    Text,
    ThemeIcon,
    Title,
} from '@mantine/core';
import { Head } from '@inertiajs/react';
import {
    IconAlertTriangle,
    IconBuilding,
    IconBuildingStore,
    IconCalendarEvent,
    IconCash,
    IconChartBar,
    IconCheck,
    IconClock,
    IconEye,
    IconPrinter,
    IconTools,
    IconUser,
} from '@tabler/icons-react';

import { PageLayout } from '@/layouts/sections/page-layout';
import { FilterBar } from '@/layouts/sections/filter-bar';
import { DataTable, type Column } from '@/layouts/sections/data-table';
import { RowActions } from '@/layouts/sections/row-actions';
import { DetailCard, DetailDrawer, DetailSection, DetailStatus } from '@/layouts/sections/detail-drawer';

import type { DesgloseLocal, ReportesStats } from '@/types/reportes.types';
import {
    ESTADOS_LOCAL_OPTIONS,
    formatMoney,
    formatPercentage,
} from './constants/reportes.constants';
import { useReportesFilters } from './hooks/useReportesFilters';
import { useReportesActions } from './hooks/useReportesActions';

interface ReportesPageProps {
    stats: ReportesStats;
    desgloseLocales: DesgloseLocal[];
}

export default function ReportesPage({ stats, desgloseLocales }: ReportesPageProps) {
    const filters = useReportesFilters(desgloseLocales);
    const actions = useReportesActions(desgloseLocales);

    const columns: Column<DesgloseLocal>[] = [
        {
            header: 'Local',
            render: (l) => (
                <Box>
                    <Group gap="xs">
                        <Badge variant="outline" color="blue" fw={700}>
                            {l.codigo}
                        </Badge>
                        <Text fw={600} size="sm">
                            {l.nombre}
                        </Text>
                    </Group>
                </Box>
            ),
        },
        {
            header: 'Ubicación',
            render: (l) => (
                <Box>
                    <Text size="sm">{l.edificio}</Text>
                    <Text size="xs" c="dimmed">
                        {l.nivel}
                    </Text>
                </Box>
            ),
        },
        {
            header: 'Locatario',
            render: (l) => (
                <Text size="sm" fw={500}>
                    {l.locatario}
                </Text>
            ),
        },
        {
            header: 'Superficie',
            render: (l) => <Text size="sm">{l.superficie} m²</Text>,
        },
        {
            header: 'Renta + Mant.',
            render: (l) => (
                <Box>
                    <Text size="sm" fw={600}>
                        {formatMoney(l.rentaMensual)}
                    </Text>
                    <Text size="xs" c="dimmed">
                        + {formatMoney(l.cuotaMantenimiento)} mant.
                    </Text>
                </Box>
            ),
        },
        {
            header: 'Total Recaudado',
            render: (l) => (
                <Text size="sm" fw={700} c="green">
                    {formatMoney(l.totalPagado)}
                </Text>
            ),
        },
        {
            header: 'Pendiente',
            render: (l) => (
                <Text size="sm" fw={600} c={l.totalPendiente > 0 ? 'orange' : 'dimmed'}>
                    {formatMoney(l.totalPendiente)}
                </Text>
            ),
        },
        {
            header: 'Estado',
            align: 'center',
            render: (l) => {
                const color =
                    l.estado === 'Ocupado'
                        ? 'green'
                        : l.estado === 'Disponible'
                        ? 'blue'
                        : l.estado === 'Mantenimiento'
                        ? 'orange'
                        : 'grape';
                return (
                    <Badge color={color} variant="light">
                        {l.estado}
                    </Badge>
                );
            },
        },
    ];

    return (
        <>
            <Head title="Reportes y Estadísticas" />

            <PageLayout
                title="Reportes y Estadísticas"
                headTitle="Reportes"
                description="Resumen analítico de cobranza, ocupación comercial y desempeño operativo"
                icon={IconChartBar}
                actions={
                    <Button
                        leftSection={<IconPrinter size={18} />}
                        variant="outline"
                        color="teal"
                        radius="md"
                        onClick={actions.handlePrint}
                    >
                        Imprimir / Exportar
                    </Button>
                }
            >
                {/* 4 KPIs Clave */}
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
                    <Card withBorder radius="md" padding="md">
                        <Group justify="space-between" align="center">
                            <Box>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                    Total Recaudado
                                </Text>
                                <Title order={3} fw={700} mt={4} c="green">
                                    {formatMoney(stats.financiero.totalRecaudado)}
                                </Title>
                                <Text size="xs" c="dimmed" mt={2}>
                                    {stats.financiero.pagosValidadosCount} pagos confirmados
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
                                    Cobranza Pendiente
                                </Text>
                                <Title order={3} fw={700} mt={4} c="yellow">
                                    {formatMoney(stats.financiero.totalPendiente)}
                                </Title>
                                <Text size="xs" c="dimmed" mt={2}>
                                    {stats.financiero.pagosPendientesCount} pagos en revisión
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
                                    Tasa de Ocupación
                                </Text>
                                <Title order={3} fw={700} mt={4} c="blue">
                                    {stats.ocupacion.tasaOcupacion}%
                                </Title>
                                <Text size="xs" c="dimmed" mt={2}>
                                    {stats.ocupacion.ocupados} de {stats.ocupacion.totalLocales} locales
                                </Text>
                            </Box>
                            <RingProgress
                                size={52}
                                thickness={5}
                                roundCaps
                                sections={[{ value: stats.ocupacion.tasaOcupacion, color: 'blue' }]}
                                label={
                                    <Center>
                                        <IconCheck size={16} color="var(--mantine-color-blue-6)" />
                                    </Center>
                                }
                            />
                        </Group>
                    </Card>

                    <Card withBorder radius="md" padding="md">
                        <Group justify="space-between" align="center">
                            <Box>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                    Incidencias Resueltas
                                </Text>
                                <Title order={3} fw={700} mt={4} c="teal">
                                    {stats.incidencias.resueltas} / {stats.incidencias.total}
                                </Title>
                                <Text size="xs" c="dimmed" mt={2}>
                                    Costo: {formatMoney(stats.incidencias.costoTotal)}
                                </Text>
                            </Box>
                            <ThemeIcon color="teal" variant="light" size="xl" radius="md">
                                <IconTools size={24} />
                            </ThemeIcon>
                        </Group>
                    </Card>
                </SimpleGrid>

                {/* Paneles de Distribución y Métricas */}
                <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                    {/* Ocupación por Edificio */}
                    <Card withBorder radius="md" padding="md">
                        <Group justify="space-between" mb="xs">
                            <Text size="sm" fw={700}>
                                Locales por Edificio
                            </Text>
                            <ThemeIcon size="sm" color="blue" variant="light">
                                <IconBuilding size={14} />
                            </ThemeIcon>
                        </Group>
                        <Stack gap="xs" mt="sm">
                            {Object.entries(stats.ocupacion.porEdificio).map(([edificio, cantidad]) => (
                                <Box key={edificio}>
                                    <Group justify="space-between" mb={4}>
                                        <Text size="xs" fw={500}>
                                            {edificio}
                                        </Text>
                                        <Text size="xs" c="dimmed">
                                            {cantidad} locales
                                        </Text>
                                    </Group>
                                    <Progress
                                        value={(cantidad / (stats.ocupacion.totalLocales || 1)) * 100}
                                        color="blue"
                                        size="sm"
                                        radius="xl"
                                    />
                                </Box>
                            ))}
                        </Stack>
                    </Card>

                    {/* Incidencias por Prioridad */}
                    <Card withBorder radius="md" padding="md">
                        <Group justify="space-between" mb="xs">
                            <Text size="sm" fw={700}>
                                Incidencias por Prioridad
                            </Text>
                            <ThemeIcon size="sm" color="red" variant="light">
                                <IconAlertTriangle size={14} />
                            </ThemeIcon>
                        </Group>
                        <Stack gap="xs" mt="sm">
                            {Object.entries(stats.incidencias.porPrioridad).map(([prioridad, cantidad]) => {
                                const color =
                                    prioridad === 'urgente'
                                        ? 'red'
                                        : prioridad === 'alta'
                                        ? 'orange'
                                        : prioridad === 'media'
                                        ? 'blue'
                                        : 'gray';
                                return (
                                    <Group key={prioridad} justify="space-between">
                                        <Badge color={color} variant="light">
                                            {prioridad.toUpperCase()}
                                        </Badge>
                                        <Text size="sm" fw={600}>
                                            {cantidad} reportes
                                        </Text>
                                    </Group>
                                );
                            })}
                        </Stack>
                    </Card>

                    {/* Uso de Áreas Comunes */}
                    <Card withBorder radius="md" padding="md">
                        <Group justify="space-between" mb="xs">
                            <Text size="sm" fw={700}>
                                Uso de Áreas Comunes
                            </Text>
                            <ThemeIcon size="sm" color="orange" variant="light">
                                <IconCalendarEvent size={14} />
                            </ThemeIcon>
                        </Group>
                        <Stack gap="xs" mt="sm">
                            {stats.reservaciones.porArea.length === 0 ? (
                                <Text size="xs" c="dimmed">
                                    No hay reservaciones registradas.
                                </Text>
                            ) : (
                                stats.reservaciones.porArea.map((area) => (
                                    <Group key={area.nombre} justify="space-between">
                                        <Text size="xs" fw={500} lineClamp={1}>
                                            {area.nombre}
                                        </Text>
                                        <Badge color="orange" variant="light">
                                            {area.total} eventos
                                        </Badge>
                                    </Group>
                                ))
                            )}
                        </Stack>
                    </Card>
                </SimpleGrid>

                {/* Filtros de la Tabla */}
                <FilterBar
                    search={{
                        value: filters.search,
                        onChange: filters.setSearch,
                        placeholder: 'Buscar por código, nombre, locatario o edificio...',
                    }}
                    filters={[
                        {
                            label: 'Estado del local',
                            data: ESTADOS_LOCAL_OPTIONS,
                            value: filters.estado,
                            onChange: filters.setEstado,
                        },
                        {
                            label: 'Edificio',
                            data: filters.edificioOptions,
                            value: filters.edificio,
                            onChange: filters.setEdificio,
                        },
                    ]}
                />

                {/* Tabla de Desglose por Local */}
                <DataTable
                    data={filters.filteredLocales}
                    columns={columns}
                    emptyMessage="No se encontraron locales con los filtros seleccionados."
                    actions={(local) => (
                        <RowActions onView={() => actions.handleViewDetail(local)} />
                    )}
                />

                {/* Drawer Detalle de Local */}
                <DetailDrawer
                    opened={actions.detailOpened}
                    onClose={actions.closeDetail}
                    title={
                        actions.selectedLocal ? (
                            <Group gap="xs">
                                <Badge size="lg" color="blue" variant="filled">
                                    {actions.selectedLocal.codigo}
                                </Badge>
                                <Text fw={700} size="md">
                                    {actions.selectedLocal.nombre}
                                </Text>
                            </Group>
                        ) : null
                    }
                >
                    {actions.selectedLocal && (
                        <>
                            <DetailStatus
                                label="Estado del Local"
                                badges={
                                    <Badge
                                        color={
                                            actions.selectedLocal.estado === 'Ocupado'
                                                ? 'green'
                                                : actions.selectedLocal.estado === 'Disponible'
                                                ? 'blue'
                                                : 'orange'
                                        }
                                        variant="filled"
                                    >
                                        {actions.selectedLocal.estado}
                                    </Badge>
                                }
                            />

                            <DetailSection title="Ubicación y Dimensiones">
                                <DetailCard
                                    items={[
                                        {
                                            icon: IconBuilding,
                                            label: 'Edificio y Nivel',
                                            value: `${actions.selectedLocal.edificio} · ${actions.selectedLocal.nivel}`,
                                        },
                                        {
                                            icon: IconBuildingStore,
                                            label: 'Superficie',
                                            value: `${actions.selectedLocal.superficie} m²`,
                                        },
                                    ]}
                                />
                            </DetailSection>

                            <DetailSection title="Información del Locatario">
                                <DetailCard
                                    items={[
                                        {
                                            icon: IconUser,
                                            label: 'Locatario asignado',
                                            value: actions.selectedLocal.locatario,
                                        },
                                    ]}
                                />
                            </DetailSection>

                            <DetailSection title="Historial Financiero del Espacio">
                                <DetailCard
                                    items={[
                                        {
                                            icon: IconCash,
                                            label: 'Renta mensual estipulada',
                                            value: formatMoney(actions.selectedLocal.rentaMensual),
                                        },
                                        {
                                            icon: IconCash,
                                            label: 'Cuota de mantenimiento',
                                            value: formatMoney(actions.selectedLocal.cuotaMantenimiento),
                                        },
                                        {
                                            icon: IconCheck,
                                            label: 'Total histórico recaudado',
                                            value: formatMoney(actions.selectedLocal.totalPagado),
                                        },
                                        {
                                            icon: IconClock,
                                            label: 'Saldo o cobros pendientes',
                                            value: formatMoney(actions.selectedLocal.totalPendiente),
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

