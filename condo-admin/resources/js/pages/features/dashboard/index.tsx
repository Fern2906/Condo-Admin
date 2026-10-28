import { Head, Link } from '@inertiajs/react';
import { Badge, Box, Card, Group, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import {
    IconArrowRight,
    IconBell,
    IconBuildingStore,
    IconCalendarClock,
    IconChartBar,
    IconFileCertificate,
    IconFileReport,
    IconHome,
    IconMessage,
    IconReceiptTax,
    IconReport,
    IconUsers,
} from '@tabler/icons-react';
import { TittlePage } from '@/matine-components/tittle-page';
import { index as localesIndex } from '@/routes/locales';
import { index as usersIndex } from '@/routes/users';
import { index as reservacionesIndex } from '@/routes/reservaciones';
import { index as incidenciasIndex } from '@/routes/incidencias';
import { index as avisosIndex } from '@/routes/avisos';
import { index as contratosIndex } from '@/routes/contratos';

interface DashboardStats {
    localesTotal: number;
    localesOcupados: number;
    localesDisponibles: number;
    incidenciasAbiertas: number;
    incidenciasSinAtender: number;
    reservacionesHoy: number;
    reservacionesHoyAprobadas: number;
    avisosVigentes: number;
    solicitudesPendientes: number;
    contratosTotal?: number;
    contratosPorVencer?: number;
    contratosVencidos?: number;
    pagosPendientes?: number;
}

export default function Dashboard({ stats: data }: { stats: DashboardStats }) {
    const kpis = [
        {
            title: 'Locales Ocupados',
            value: data.localesOcupados,
            total: data.localesTotal,
            icon: IconHome,
            color: 'blue',
            description: `${data.localesDisponibles} disponibles`,
        },
        {
            title: 'Incidencias Abiertas',
            value: data.incidenciasAbiertas,
            icon: IconReport,
            color: 'red',
            description: `${data.incidenciasSinAtender} sin atender`,
        },
        {
            title: 'Reservaciones Hoy',
            value: data.reservacionesHoy,
            icon: IconCalendarClock,
            color: 'orange',
            description: `${data.reservacionesHoyAprobadas} aprobadas`,
        },
        {
            title: 'Contratos Activos',
            value: data.contratosTotal ?? 0,
            icon: IconFileCertificate,
            color: 'cyan',
            description:
                (data.contratosPorVencer ?? 0) > 0
                    ? `${data.contratosPorVencer} por vencer (30 días)`
                    : (data.contratosVencidos ?? 0) > 0
                    ? `${data.contratosVencidos} vencidos`
                    : 'Control y vigencias',
        },
    ];

    const quickActions = [
        { title: 'Locales', description: 'Gestionar espacios comerciales', icon: IconBuildingStore, color: 'blue', href: localesIndex.url() },
        { title: 'Locatarios', description: 'Administrar inquilinos', icon: IconUsers, color: 'violet', href: usersIndex.url() },
        { title: 'Cuotas y pagos', description: 'Control financiero y cobranza', icon: IconReceiptTax, color: 'green', href: '/pagos', badge: data.pagosPendientes },
        { title: 'Incidencias', description: 'Seguimiento y atención', icon: IconReport, color: 'red', href: incidenciasIndex.url(), badge: data.incidenciasAbiertas },
        { title: 'Reservaciones', description: 'Áreas comunes', icon: IconCalendarClock, color: 'orange', href: reservacionesIndex.url(), badge: data.reservacionesHoy },
        { title: 'Avisos', description: 'Comunicación general', icon: IconBell, color: 'yellow', href: avisosIndex.url(), badge: data.avisosVigentes },
        { title: 'Reportes', description: 'Estadísticas y análisis', icon: IconChartBar, color: 'teal' },
        { title: 'Mensajes', description: 'Buzón de solicitudes', icon: IconMessage, color: 'pink', badge: data.solicitudesPendientes },
        {
            title: 'Contratos',
            description: 'Vigencias y asignaciones',
            icon: IconFileCertificate,
            color: 'cyan',
            href: contratosIndex.url(),
            badge: (data.contratosPorVencer ?? 0) + (data.contratosVencidos ?? 0),
        },
    ];

    return (
        <>
            <Head title="Dashboard" />

            <Stack gap="xl" p={{ base: 'sm', md: 'md' }} w="100%" h="100%">
                <TittlePage
                    title="Panel de Administración"
                    message="Resumen general del condominio"
                    icon={<IconChartBar size={40} color="var(--mantine-color-blue-8)" />}
                />

                <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
                    {kpis.map((kpi) => (
                        <Card key={kpi.title} withBorder radius="lg" padding="lg" shadow="sm">
                            <Group justify="space-between" align="flex-start" wrap="nowrap">
                                <Stack gap="xs">
                                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                        {kpi.title}
                                    </Text>
                                    <Group align="baseline" gap="xs">
                                        <Title order={2} fw={700}>
                                            {kpi.value}
                                        </Title>
                                        {kpi.total !== undefined && (
                                            <Text size="sm" c="dimmed">
                                                / {kpi.total}
                                            </Text>
                                        )}
                                    </Group>
                                    <Text size="xs" c="dimmed">
                                        {kpi.description}
                                    </Text>
                                </Stack>
                                <ThemeIcon size={56} radius="xl" variant="light" color={kpi.color}>
                                    <kpi.icon size={28} stroke={1.5} />
                                </ThemeIcon>
                            </Group>
                        </Card>
                    ))}
                </SimpleGrid>

                <Card withBorder radius="lg" padding={{ base: 'md', md: 'lg' }} shadow="sm">
                    <Group justify="space-between" mb="lg" wrap="wrap">
                        <Stack gap={4}>
                            <Title order={3} fw={600}>
                                Acciones Rápidas
                            </Title>
                            <Text size="sm" c="dimmed">
                                Accede rápidamente a las funciones principales
                            </Text>
                        </Stack>
                    </Group>
                    <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 4, lg: 5 }} spacing="md">
                        {quickActions.map((action) => (
                            <Card
                                key={action.title}
                                component={action.href ? Link : 'div'}
                                href={action.href}
                                withBorder
                                radius="md"
                                padding="md"
                                className={action.href ? 'group cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-blue-400/60' : 'opacity-60'}
                                style={{
                                    textDecoration: 'none',
                                }}
                            >
                                <Stack gap="sm">
                                    <Group justify="space-between" align="flex-start">
                                        <ThemeIcon size={44} radius="md" variant="light" color={action.color}>
                                            <action.icon size={24} stroke={1.5} />
                                        </ThemeIcon>
                                        {action.badge !== undefined && action.badge > 0 && (
                                            <Badge color="red" variant="filled" size="sm">
                                                {action.badge}
                                            </Badge>
                                        )}
                                    </Group>
                                    <Stack gap={2}>
                                        <Group justify="space-between" align="center">
                                            <Text fw={600} size="sm">
                                                {action.title}
                                            </Text>
                                            {action.href && <IconArrowRight size={16} className="opacity-0 transition-opacity duration-200 group-hover:opacity-100" color="var(--mantine-color-dimmed)" />}
                                        </Group>
                                        <Text size="xs" c="dimmed" lineClamp={2}>
                                            {action.description}
                                        </Text>
                                    </Stack>
                                </Stack>
                            </Card>
                        ))}
                    </SimpleGrid>
                </Card>
            </Stack>
        </>
    );
}
