import { Head } from '@inertiajs/react';
import {Box,Card,Grid,SimpleGrid,Stack,Text,Title,} from '@mantine/core';
import {IconBell,IconBuildingStore,IconCalendarClock,IconChartBar,IconFileReport,IconHome,IconMessage,IconReceiptTax,IconReport,IconUsers,} from '@tabler/icons-react';
import { StatCard } from '@/matine-components/stat-card';
import { ActionButton } from '@/matine-components/action-button';

const adminActions = [
    { title: 'Locales', icon: IconBuildingStore, color: 'blue' },
    { title: 'Locatarios', icon: IconUsers, color: 'violet' },
    { title: 'Cuotas y pagos', icon: IconReceiptTax, color: 'green' },
    { title: 'Incidencias', icon: IconReport, color: 'red', badge: '3' },
    { title: 'Reservaciones', icon: IconCalendarClock, color: 'orange' },
    { title: 'Avisos', icon: IconBell, color: 'yellow', badge: '2' },
    { title: 'Reportes', icon: IconChartBar, color: 'teal' },
    { title: 'Mensajes', icon: IconMessage, color: 'pink', badge: '5' },
    { title: 'Contratos', icon: IconFileReport, color: 'cyan' },
];

const stats = [
    {label: 'Locales ocupados',value: '24 / 30',icon: IconHome,color: 'blue',progress: 80,description: '6 locales disponibles',},
    {label: 'Incidencias abiertas',value: '3',icon: IconReport,color: 'red',progress: 30,description: '2 pendientes de atender',},
    {label: 'Reservaciones hoy',value: '7',icon: IconCalendarClock,color: 'orange',progress: 70,description: 'Áreas comunes',},
];

export default function Dashboard() {
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

