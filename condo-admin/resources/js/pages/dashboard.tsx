import { Head } from '@inertiajs/react';
import {Box,Card,Grid,SimpleGrid,Stack,Text,Title,} from '@mantine/core';
import {IconBell,IconBuildingStore,IconCalendarClock,IconChartBar,IconFileReport,IconHome,IconMessage,IconReceiptTax,IconReport,IconUsers,} from '@tabler/icons-react';
import { StatCard } from '@/matine-components/stat-card';
import { ActionButton } from '@/matine-components/action-button';
import { index as localesIndex } from '@/routes/locales';
import { index as usersIndex } from '@/routes/users';
import { index as reservacionesIndex } from '@/routes/reservaciones';

// Conteos que entrega App\Http\Controllers\DashboardController
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
}

const percentage = (part: number, total: number) => (total > 0 ? Math.round((part / total) * 100) : 0);
const badge = (count: number) => (count > 0 ? String(count) : undefined);

export default function Dashboard({ stats: data }: { stats: DashboardStats }) {
    const adminActions = [
        { title: 'Locales', icon: IconBuildingStore, color: 'blue', href: localesIndex.url() },
        { title: 'Locatarios', icon: IconUsers, color: 'violet', href: usersIndex.url() },
        { title: 'Cuotas y pagos', icon: IconReceiptTax, color: 'green' },
        { title: 'Incidencias', icon: IconReport, color: 'red', badge: badge(data.incidenciasAbiertas) },
        { title: 'Reservaciones', icon: IconCalendarClock, color: 'orange', badge: badge(data.reservacionesHoy), href: reservacionesIndex.url() },
        { title: 'Avisos', icon: IconBell, color: 'yellow', badge: badge(data.avisosVigentes) },
        { title: 'Reportes', icon: IconChartBar, color: 'teal' },
        { title: 'Mensajes', icon: IconMessage, color: 'pink', badge: badge(data.solicitudesPendientes) },
        { title: 'Contratos', icon: IconFileReport, color: 'cyan' },
    ];

    const stats = [
        {
            label: 'Locales ocupados',
            value: `${data.localesOcupados} / ${data.localesTotal}`,
            icon: IconHome,
            color: 'blue',
            progress: percentage(data.localesOcupados, data.localesTotal),
            description: `${data.localesDisponibles} locales disponibles`,
        },
        {
            label: 'Incidencias abiertas',
            value: String(data.incidenciasAbiertas),
            icon: IconReport,
            color: 'red',
            progress: percentage(data.incidenciasSinAtender, data.incidenciasAbiertas),
            description: `${data.incidenciasSinAtender} pendientes de atender`,
        },
        {
            label: 'Reservaciones hoy',
            value: String(data.reservacionesHoy),
            icon: IconCalendarClock,
            color: 'orange',
            progress: percentage(data.reservacionesHoyAprobadas, data.reservacionesHoy),
            description: `${data.reservacionesHoyAprobadas} aprobadas · áreas comunes`,
        },
    ];

    return (
        <>
            <Head title="Dashboard" />

            <Stack gap="xl" p="md">
                <Box>
                    <Title order={2} fw={600}>
                        Panel de administración
                    </Title>
                    <Text c="dimmed" size="sm" mt={4}>
                        Resumen general del condominio
                    </Text>
                </Box>

                <Grid justify="space-between" align='center' gap={"lg"}>
                    {stats.map((stat) => (
                        <Grid.Col key={stat.label} span={"auto"}>
                            <div style={{ width: '100%' }}>
                                <StatCard stat={stat} />
                            </div>
                        </Grid.Col>
                    ))}
                </Grid>

                <Card withBorder radius="md" padding="lg">
                    <Text fw={600} size="sm" mb="md">
                        Acciones rápidas
                    </Text>
                    <SimpleGrid cols={{ base: 2, sm: 2, md: 4, lg: 6 }}>
                        {adminActions.map((item) => (
                            <ActionButton key={item.title} item={item} />
                        ))}
                    </SimpleGrid>
                </Card>
            </Stack>
        </>
    );
}

