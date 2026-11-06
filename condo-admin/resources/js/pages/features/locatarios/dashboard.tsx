import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Alert,
    Badge,
    Button,
    Card,
    Divider,
    Group,
    Modal,
    NumberInput,
    Paper,
    Select,
    SimpleGrid,
    Stack,
    Table,
    Tabs,
    Text,
    TextInput,
    Textarea,
    ThemeIcon,
    Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconAlertCircle,
    IconAlertTriangle,
    IconArrowRight,
    IconBell,
    IconBuildingStore,
    IconCalendar,
    IconCalendarClock,
    IconCalendarPlus,
    IconCheck,
    IconClock,
    IconCreditCard,
    IconFileCertificate,
    IconInfoCircle,
    IconMail,
    IconMapPin,
    IconMessage,
    IconMessageCircle,
    IconPlus,
    IconReceipt,
    IconReceiptTax,
    IconReport,
    IconUserCheck,
} from '@tabler/icons-react';
import { toast } from 'sonner';
import { TittlePage } from '@/matine-components/tittle-page';

interface LocalInfo {
    id: number;
    codigo: string;
    nombre: string;
    giro: string | null;
    edificio: string;
    nivel: string | null;
    superficieM2: number;
    rentaMensual: number;
    cuotaMantenimiento: number;
    estado: string;
}

interface ContratoInfo {
    id: number;
    localCodigo: string | null;
    localNombre: string | null;
    tipoRelacion: string;
    habitaLocal: boolean;
    responsablePago: boolean;
    fechaInicio: string | null;
    fechaFin: string | null;
    diasRestantes: number | null;
    estado: 'Vigente' | 'Por vencer' | 'Vencido' | 'Indefinido';
}

interface PagoItem {
    id: number;
    localNombre: string;
    monto: number;
    fechaPago: string;
    estado: 'pendiente' | 'validado' | 'rechazado';
    comprobanteUrl: string | null;
    motivoRechazo: string | null;
    reciboFolio: string | null;
    notas: string | null;
}

interface CargoItem {
    id: number;
    concepto: string;
    periodo: string | null;
    monto: number;
    fechaVencimiento: string | null;
    cuotaNombre: string | null;
}

interface IncidenciaItem {
    id: number;
    titulo: string;
    descripcion: string;
    categoria: string | null;
    lugar: string;
    prioridad: 'baja' | 'media' | 'alta' | 'urgente';
    estado: 'abierta' | 'asignada' | 'en_proceso' | 'resuelta' | 'cerrada' | 'cancelada';
    fechaReporte: string;
    comentario: string | null;
}

interface ReservacionItem {
    id: number;
    areaComun: string | null;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    numAsistentes: number | null;
    motivo: string | null;
    estado: 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada';
    motivoRechazo: string | null;
}

interface AvisoItem {
    id: number;
    titulo: string;
    contenido: string;
    tipo: 'general' | 'mantenimiento' | 'evento' | 'urgente';
    fechaPublicacion: string;
    fechaEvento: string | null;
    fijado: boolean;
}

interface SelectOption {
    value: string;
    label: string;
    [key: string]: unknown;
}

interface DashboardLocatarioProps {
    local: LocalInfo | null;
    contrato: ContratoInfo | null;
    pagos: PagoItem[];
    cargos: CargoItem[];
    totalAdeudo: number;
    incidencias: IncidenciaItem[];
    reservaciones: ReservacionItem[];
    avisos: AvisoItem[];
    mensajesNoLeidos: number;
    catalogos: {
        categoriasIncidencia: SelectOption[];
        areasComunes: SelectOption[];
        locales: SelectOption[];
    };
}

export default function LocatarioDashboard({
    local,
    contrato,
    pagos,
    cargos,
    totalAdeudo,
    incidencias,
    reservaciones,
    avisos,
    mensajesNoLeidos,
    catalogos,
}: DashboardLocatarioProps) {
    const [incidenciaOpened, { open: openIncidencia, close: closeIncidencia }] = useDisclosure(false);
    const [reservacionOpened, { open: openReservacion, close: closeReservacion }] = useDisclosure(false);
    const [pagoOpened, { open: openPago, close: closePago }] = useDisclosure(false);
    const [activeTab, setActiveTab] = useState<string | null>('general');

    // Formulario de nueva incidencia
    const [incidenciaForm, setIncidenciaForm] = useState({
        titulo: '',
        descripcion: '',
        categoria_id: catalogos.categoriasIncidencia[0]?.value ?? '',
        prioridad: 'media',
        destino: 'local', // 'local' | 'area_comun'
        area_comun_id: catalogos.areasComunes[0]?.value ?? '',
    });
    const [isSubmittingIncidencia, setIsSubmittingIncidencia] = useState(false);

    // Formulario de nueva reservación
    const [reservacionForm, setReservacionForm] = useState({
        areaComunId: catalogos.areasComunes[0]?.value ?? '',
        fecha: new Date().toISOString().split('T')[0],
        horaInicio: '09:00',
        horaFin: '11:00',
        numAsistentes: 5,
        motivo: '',
    });
    const [isSubmittingReservacion, setIsSubmittingReservacion] = useState(false);

    // Formulario de reportar pago
    const [pagoForm, setPagoForm] = useState({
        localId: local?.id ? String(local.id) : (catalogos.locales[0]?.value ?? ''),
        monto: local?.cuotaMantenimiento ?? 500,
        fechaPago: new Date().toISOString().split('T')[0],
        notas: '',
        comprobanteUrl: '',
    });
    const [isSubmittingPago, setIsSubmittingPago] = useState(false);

    const handleCreateIncidencia = (e: React.FormEvent) => {
        e.preventDefault();
        if (!incidenciaForm.titulo || !incidenciaForm.descripcion || !incidenciaForm.categoria_id) {
            toast.error('Por favor completa todos los campos requeridos');
            return;
        }

        setIsSubmittingIncidencia(true);
        router.post(
            '/incidencias',
            {
                titulo: incidenciaForm.titulo,
                descripcion: incidenciaForm.descripcion,
                categoria_id: Number(incidenciaForm.categoria_id),
                prioridad: incidenciaForm.prioridad,
                local_id: incidenciaForm.destino === 'local' && local ? local.id : null,
                area_comun_id: incidenciaForm.destino === 'area_comun' && incidenciaForm.area_comun_id ? Number(incidenciaForm.area_comun_id) : null,
            },
            {
                onSuccess: () => {
                    toast.success('Incidencia reportada con éxito');
                    closeIncidencia();
                    setIncidenciaForm({
                        titulo: '',
                        descripcion: '',
                        categoria_id: catalogos.categoriasIncidencia[0]?.value ?? '',
                        prioridad: 'media',
                        destino: 'local',
                        area_comun_id: catalogos.areasComunes[0]?.value ?? '',
                    });
                },
                onError: (errors) => {
                    const firstError = Object.values(errors)[0] as string;
                    toast.error(firstError || 'Error al reportar la incidencia');
                },
                onFinish: () => setIsSubmittingIncidencia(false),
            }
        );
    };

    const handleCreateReservacion = (e: React.FormEvent) => {
        e.preventDefault();
        if (!reservacionForm.areaComunId || !reservacionForm.fecha || !reservacionForm.horaInicio || !reservacionForm.horaFin) {
            toast.error('Por favor completa los campos de fecha y horario');
            return;
        }

        setIsSubmittingReservacion(true);
        router.post(
            '/reservaciones',
            {
                areaComunId: Number(reservacionForm.areaComunId),
                fecha: reservacionForm.fecha,
                horaInicio: reservacionForm.horaInicio,
                horaFin: reservacionForm.horaFin,
                numAsistentes: reservacionForm.numAsistentes ? Number(reservacionForm.numAsistentes) : null,
                motivo: reservacionForm.motivo || null,
                estado: 'pendiente',
            },
            {
                onSuccess: () => {
                    toast.success('Solicitud de reservación enviada correctamente');
                    closeReservacion();
                    setReservacionForm({
                        areaComunId: catalogos.areasComunes[0]?.value ?? '',
                        fecha: new Date().toISOString().split('T')[0],
                        horaInicio: '09:00',
                        horaFin: '11:00',
                        numAsistentes: 5,
                        motivo: '',
                    });
                },
                onError: (errors) => {
                    const firstError = Object.values(errors)[0] as string;
                    toast.error(firstError || 'Error al crear la reservación');
                },
                onFinish: () => setIsSubmittingReservacion(false),
            }
        );
    };

    const handleCreatePago = (e: React.FormEvent) => {
        e.preventDefault();
        if (!pagoForm.localId || !pagoForm.monto || !pagoForm.fechaPago) {
            toast.error('Por favor especifica el monto y la fecha de pago');
            return;
        }

        setIsSubmittingPago(true);
        router.post(
            '/pagos',
            {
                localId: Number(pagoForm.localId),
                monto: Number(pagoForm.monto),
                fechaPago: pagoForm.fechaPago,
                notas: pagoForm.notas || null,
                comprobanteUrl: pagoForm.comprobanteUrl || null,
                estado: 'pendiente',
            },
            {
                onSuccess: () => {
                    toast.success('Pago reportado para validación de administración');
                    closePago();
                    setPagoForm({
                        localId: local?.id ? String(local.id) : (catalogos.locales[0]?.value ?? ''),
                        monto: local?.cuotaMantenimiento ?? 500,
                        fechaPago: new Date().toISOString().split('T')[0],
                        notas: '',
                        comprobanteUrl: '',
                    });
                },
                onError: (errors) => {
                    const firstError = Object.values(errors)[0] as string;
                    toast.error(firstError || 'Error al registrar el pago');
                },
                onFinish: () => setIsSubmittingPago(false),
            }
        );
    };

    const getEstadoBadge = (estado: string) => {
        switch (estado.toLowerCase()) {
            case 'validado':
            case 'vigente':
            case 'resuelta':
            case 'cerrada':
            case 'aprobada':
                return <Badge color="green" variant="light">{estado}</Badge>;
            case 'pendiente':
            case 'abierta':
            case 'por vencer':
            case 'en_proceso':
            case 'asignada':
                return <Badge color="yellow" variant="light">{estado.replace('_', ' ')}</Badge>;
            case 'rechazado':
            case 'rechazada':
            case 'vencido':
            case 'cancelada':
                return <Badge color="red" variant="light">{estado}</Badge>;
            default:
                return <Badge color="gray" variant="light">{estado}</Badge>;
        }
    };

    const getPrioridadBadge = (prioridad: string) => {
        switch (prioridad) {
            case 'urgente':
                return <Badge color="red" variant="filled">Urgente</Badge>;
            case 'alta':
                return <Badge color="orange" variant="light">Alta</Badge>;
            case 'media':
                return <Badge color="blue" variant="light">Media</Badge>;
            default:
                return <Badge color="gray" variant="light">Baja</Badge>;
        }
    };

    return (
        <>
            <Head title="Portal del Locatario" />

            <Stack gap="xl" p={{ base: 'sm', md: 'md' }} w="100%" h="100%">
                {/* Encabezado */}
                <Group justify="space-between" align="center" wrap="wrap">
                    <TittlePage
                        title="Portal del Locatario"
                        message="Panel de control para la gestión de tu local, pagos, incidencias y servicios"
                        icon={<IconBuildingStore size={40} color="var(--mantine-color-blue-6)" />}
                    />
                    <Group gap="xs">
                        <Button
                            variant="filled"
                            color="blue"
                            leftSection={<IconReport size={18} />}
                            onClick={openIncidencia}
                        >
                            Reportar Incidencia
                        </Button>
                        <Button
                            variant="light"
                            color="cyan"
                            leftSection={<IconCalendarPlus size={18} />}
                            onClick={openReservacion}
                        >
                            Reservar Área
                        </Button>
                        <Button
                            variant="light"
                            color="teal"
                            leftSection={<IconCreditCard size={18} />}
                            onClick={openPago}
                        >
                            Reportar Pago
                        </Button>
                    </Group>
                </Group>

                {/* KPIs / Tarjetas Rápidas de Resumen */}
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
                    {/* Local */}
                    <Card withBorder radius="lg" padding="md" shadow="sm">
                        <Group justify="space-between" align="flex-start" wrap="nowrap">
                            <Stack gap={2}>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                    Mi Local
                                </Text>
                                <Title order={3} fw={700}>
                                    {local ? `${local.codigo}` : 'Sin Asignar'}
                                </Title>
                                <Text size="xs" c="dimmed" lineClamp={1}>
                                    {local ? local.nombre : 'Comunícate con administración'}
                                </Text>
                            </Stack>
                            <ThemeIcon size={46} radius="md" variant="light" color="blue">
                                <IconBuildingStore size={24} />
                            </ThemeIcon>
                        </Group>
                    </Card>

                    {/* Contrato */}
                    <Card withBorder radius="lg" padding="md" shadow="sm">
                        <Group justify="space-between" align="flex-start" wrap="nowrap">
                            <Stack gap={2}>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                    Estado Contrato
                                </Text>
                                <Group gap={6} align="center">
                                    <Title order={3} fw={700}>
                                        {contrato?.estado ?? 'Sin Contrato'}
                                    </Title>
                                </Group>
                                <Text size="xs" c="dimmed">
                                    {contrato?.diasRestantes !== null && contrato?.diasRestantes !== undefined
                                        ? contrato.diasRestantes > 0
                                            ? `${contrato.diasRestantes} días restantes`
                                            : 'Vencido'
                                        : 'Vigencia no especificada'}
                                </Text>
                            </Stack>
                            <ThemeIcon size={46} radius="md" variant="light" color={contrato?.estado === 'Vigente' ? 'green' : 'orange'}>
                                <IconFileCertificate size={24} />
                            </ThemeIcon>
                        </Group>
                    </Card>

                    {/* Finanzas */}
                    <Card withBorder radius="lg" padding="md" shadow="sm">
                        <Group justify="space-between" align="flex-start" wrap="nowrap">
                            <Stack gap={2}>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                    Adeudo Pendiente
                                </Text>
                                <Title order={3} fw={700} c={totalAdeudo > 0 ? 'red.6' : 'green.6'}>
                                    ${totalAdeudo.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </Title>
                                <Text size="xs" c="dimmed">
                                    Cuota mto: ${Number(local?.cuotaMantenimiento ?? 0).toFixed(2)}/mes
                                </Text>
                            </Stack>
                            <ThemeIcon size={46} radius="md" variant="light" color={totalAdeudo > 0 ? 'red' : 'green'}>
                                <IconReceiptTax size={24} />
                            </ThemeIcon>
                        </Group>
                    </Card>

                    {/* Mensajes */}
                    <Card
                        component={Link}
                        href="/mensajes"
                        withBorder
                        radius="lg"
                        padding="md"
                        shadow="sm"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                        className="transition-all duration-200 hover:-translate-y-1 hover:shadow-md hover:border-violet-400/60"
                    >
                        <Group justify="space-between" align="flex-start" wrap="nowrap">
                            <Stack gap={2}>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                    Mensajería
                                </Text>
                                <Group gap={6} align="center">
                                    <Title order={3} fw={700}>
                                        Chat en vivo
                                    </Title>
                                    {mensajesNoLeidos > 0 && (
                                        <Badge color="red" size="sm" variant="filled">
                                            {mensajesNoLeidos} nuevo{mensajesNoLeidos > 1 ? 's' : ''}
                                        </Badge>
                                    )}
                                </Group>
                                <Text size="xs" c="dimmed">
                                    Comunicación directa con admin
                                </Text>
                            </Stack>
                            <ThemeIcon size={46} radius="md" variant="light" color="violet">
                                <IconMessage size={24} />
                            </ThemeIcon>
                        </Group>
                    </Card>
                </SimpleGrid>

                {/* Contenido Principal con Pestañas */}
                <Tabs value={activeTab} onChange={setActiveTab} radius="md">
                    <Tabs.List mb="md">
                        <Tabs.Tab value="general" leftSection={<IconBuildingStore size={16} />}>
                            Mi Local & Contrato
                        </Tabs.Tab>
                        <Tabs.Tab value="pagos" leftSection={<IconReceiptTax size={16} />}>
                            Cuotas y Pagos ({pagos.length})
                        </Tabs.Tab>
                        <Tabs.Tab value="incidencias" leftSection={<IconReport size={16} />}>
                            Incidencias ({incidencias.length})
                        </Tabs.Tab>
                        <Tabs.Tab value="reservaciones" leftSection={<IconCalendarClock size={16} />}>
                            Reservaciones ({reservaciones.length})
                        </Tabs.Tab>
                        <Tabs.Tab value="avisos" leftSection={<IconBell size={16} />}>
                            Avisos ({avisos.length})
                        </Tabs.Tab>
                    </Tabs.List>

                    {/* PESTAÑA 1: LOCAL & CONTRATO */}
                    <Tabs.Panel value="general">
                        <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                            {/* Información del Local */}
                            <Card withBorder radius="lg" padding="lg" shadow="sm">
                                <Group justify="space-between" mb="md">
                                    <Group gap="xs">
                                        <ThemeIcon color="blue" variant="light" size="lg" radius="md">
                                            <IconBuildingStore size={20} />
                                        </ThemeIcon>
                                        <Title order={4} fw={600}>
                                            Detalles de mi Local
                                        </Title>
                                    </Group>
                                    {local?.estado && getEstadoBadge(local.estado)}
                                </Group>

                                {local ? (
                                    <Stack gap="sm">
                                        <Group justify="space-between" py={6} style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                                            <Text size="sm" c="dimmed">Nombre comercial:</Text>
                                            <Text size="sm" fw={600}>{local.nombre}</Text>
                                        </Group>
                                        <Group justify="space-between" py={6} style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                                            <Text size="sm" c="dimmed">Código de local:</Text>
                                            <Badge variant="outline" color="blue">{local.codigo}</Badge>
                                        </Group>
                                        <Group justify="space-between" py={6} style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                                            <Text size="sm" c="dimmed">Giro comercial:</Text>
                                            <Text size="sm" fw={500}>{local.giro || 'No especificado'}</Text>
                                        </Group>
                                        <Group justify="space-between" py={6} style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                                            <Text size="sm" c="dimmed">Ubicación física:</Text>
                                            <Text size="sm" fw={500}>{local.edificio} {local.nivel ? `· Nivel ${local.nivel}` : ''}</Text>
                                        </Group>
                                        <Group justify="space-between" py={6} style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                                            <Text size="sm" c="dimmed">Superficie:</Text>
                                            <Text size="sm" fw={500}>{local.superficieM2} m²</Text>
                                        </Group>
                                        <Group justify="space-between" py={6} style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                                            <Text size="sm" c="dimmed">Renta mensual:</Text>
                                            <Text size="sm" fw={600}>${Number(local.rentaMensual).toFixed(2)}</Text>
                                        </Group>
                                        <Group justify="space-between" py={6}>
                                            <Text size="sm" c="dimmed">Cuota de mantenimiento:</Text>
                                            <Text size="sm" fw={600} c="blue.6">${Number(local.cuotaMantenimiento).toFixed(2)}</Text>
                                        </Group>
                                    </Stack>
                                ) : (
                                    <Alert icon={<IconInfoCircle size={16} />} title="Sin local registrado" color="blue">
                                        Actualmente no tienes un local comercial asignado a tu cuenta. Comunícate con la administración para asociar tu contrato.
                                    </Alert>
                                )}
                            </Card>

                            {/* Información del Contrato */}
                            <Card withBorder radius="lg" padding="lg" shadow="sm">
                                <Group justify="space-between" mb="md">
                                    <Group gap="xs">
                                        <ThemeIcon color="teal" variant="light" size="lg" radius="md">
                                            <IconFileCertificate size={20} />
                                        </ThemeIcon>
                                        <Title order={4} fw={600}>
                                            Contrato de Arrendamiento
                                        </Title>
                                    </Group>
                                    {contrato?.estado && getEstadoBadge(contrato.estado)}
                                </Group>

                                {contrato ? (
                                    <Stack gap="sm">
                                        <Group justify="space-between" py={6} style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                                            <Text size="sm" c="dimmed">Tipo de relación:</Text>
                                            <Badge variant="light" color="violet">{contrato.tipoRelacion.toUpperCase()}</Badge>
                                        </Group>
                                        <Group justify="space-between" py={6} style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                                            <Text size="sm" c="dimmed">Fecha de inicio:</Text>
                                            <Text size="sm" fw={500}>{contrato.fechaInicio || 'No registrada'}</Text>
                                        </Group>
                                        <Group justify="space-between" py={6} style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                                            <Text size="sm" c="dimmed">Fecha de vencimiento:</Text>
                                            <Text size="sm" fw={600}>{contrato.fechaFin || 'Indefinido'}</Text>
                                        </Group>
                                        <Group justify="space-between" py={6} style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                                            <Text size="sm" c="dimmed">Días de vigencia restantes:</Text>
                                            <Text size="sm" fw={700} c={contrato.diasRestantes && contrato.diasRestantes <= 30 ? 'orange.6' : 'teal.6'}>
                                                {contrato.diasRestantes !== null ? `${contrato.diasRestantes} días` : 'Indefinido'}
                                            </Text>
                                        </Group>
                                        <Group justify="space-between" py={6} style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                                            <Text size="sm" c="dimmed">Responsable de pago:</Text>
                                            <Badge color={contrato.responsablePago ? 'green' : 'gray'} variant="light">
                                                {contrato.responsablePago ? 'Sí' : 'No'}
                                            </Badge>
                                        </Group>
                                        <Group justify="space-between" py={6}>
                                            <Text size="sm" c="dimmed">Habita el local:</Text>
                                            <Badge color={contrato.habitaLocal ? 'blue' : 'gray'} variant="light">
                                                {contrato.habitaLocal ? 'Sí' : 'No'}
                                            </Badge>
                                        </Group>
                                    </Stack>
                                ) : (
                                    <Alert icon={<IconInfoCircle size={16} />} title="Sin contrato activo" color="gray">
                                        No se encontró información de contrato vigente vinculado a tu usuario.
                                    </Alert>
                                )}
                            </Card>
                        </SimpleGrid>

                        {/* Banner de comunicación rápida */}
                        <Card withBorder radius="lg" p="lg" shadow="sm" mt="lg" bg="var(--mantine-color-violet-light)">
                            <Group justify="space-between" align="center" wrap="wrap">
                                <Group gap="md">
                                    <ThemeIcon size={48} radius="xl" color="violet">
                                        <IconMessageCircle size={28} />
                                    </ThemeIcon>
                                    <Stack gap={2}>
                                        <Title order={4} fw={600}>
                                            ¿Tienes dudas con tu contrato o pagos?
                                        </Title>
                                        <Text size="sm" c="dimmed">
                                            Comunícate en tiempo real con la administración del condominio mediante la mensajería interna.
                                        </Text>
                                    </Stack>
                                </Group>
                                <Button
                                    component={Link}
                                    href="/mensajes"
                                    color="violet"
                                    variant="filled"
                                    rightSection={<IconArrowRight size={16} />}
                                >
                                    Abrir Mensajería
                                </Button>
                            </Group>
                        </Card>
                    </Tabs.Panel>

                    {/* PESTAÑA 2: CUOTAS Y PAGOS */}
                    <Tabs.Panel value="pagos">
                        <Stack gap="md">
                            <Group justify="space-between" align="center">
                                <Stack gap={2}>
                                    <Title order={4} fw={600}>Historial de Pagos y Cuotas</Title>
                                    <Text size="sm" c="dimmed">Revisa tus comprobantes, recibos y adeudos pendientes</Text>
                                </Stack>
                                <Button
                                    variant="filled"
                                    color="teal"
                                    leftSection={<IconPlus size={16} />}
                                    onClick={openPago}
                                >
                                    Reportar Pago
                                </Button>
                            </Group>

                            {/* Cargos pendientes */}
                            {cargos.length > 0 && (
                                <Card withBorder radius="lg" padding="md" shadow="xs" bg="var(--mantine-color-red-light)">
                                    <Title order={5} fw={600} mb="xs" c="red.9">
                                        Cargos y Cuotas por Liquidar
                                    </Title>
                                    <Table verticalSpacing="xs">
                                        <Table.Thead>
                                            <Table.Tr>
                                                <Table.Th>Concepto</Table.Th>
                                                <Table.Th>Periodo</Table.Th>
                                                <Table.Th>Vencimiento</Table.Th>
                                                <Table.Th style={{ textAlign: 'right' }}>Monto</Table.Th>
                                            </Table.Tr>
                                        </Table.Thead>
                                        <Table.Tbody>
                                            {cargos.map((cargo) => (
                                                <Table.Tr key={cargo.id}>
                                                    <Table.Td fw={500}>{cargo.concepto}</Table.Td>
                                                    <Table.Td>{cargo.periodo || '-'}</Table.Td>
                                                    <Table.Td>{cargo.fechaVencimiento || '-'}</Table.Td>
                                                    <Table.Td style={{ textAlign: 'right' }} fw={600} c="red.7">
                                                        ${cargo.monto.toFixed(2)}
                                                    </Table.Td>
                                                </Table.Tr>
                                            ))}
                                        </Table.Tbody>
                                    </Table>
                                </Card>
                            )}

                            {/* Tabla de Pagos */}
                            <Card withBorder radius="lg" padding="md" shadow="sm">
                                {pagos.length > 0 ? (
                                    <Table.ScrollContainer minWidth={600}>
                                        <Table verticalSpacing="sm" striped highlightOnHover>
                                            <Table.Thead>
                                                <Table.Tr>
                                                    <Table.Th>Fecha</Table.Th>
                                                    <Table.Th>Local</Table.Th>
                                                    <Table.Th>Monto</Table.Th>
                                                    <Table.Th>Estado</Table.Th>
                                                    <Table.Th>Recibo / Folio</Table.Th>
                                                    <Table.Th>Notas / Observaciones</Table.Th>
                                                </Table.Tr>
                                            </Table.Thead>
                                            <Table.Tbody>
                                                {pagos.map((pago) => (
                                                    <Table.Tr key={pago.id}>
                                                        <Table.Td fw={500}>{pago.fechaPago}</Table.Td>
                                                        <Table.Td>{pago.localNombre}</Table.Td>
                                                        <Table.Td fw={600}>${pago.monto.toFixed(2)}</Table.Td>
                                                        <Table.Td>{getEstadoBadge(pago.estado)}</Table.Td>
                                                        <Table.Td>
                                                            {pago.reciboFolio ? (
                                                                <Badge color="blue" variant="outline">
                                                                    {pago.reciboFolio}
                                                                </Badge>
                                                            ) : pago.motivoRechazo ? (
                                                                <Text size="xs" c="red">
                                                                    Rechazo: {pago.motivoRechazo}
                                                                </Text>
                                                            ) : (
                                                                <Text size="xs" c="dimmed">En validación</Text>
                                                            )}
                                                        </Table.Td>
                                                        <Table.Td>
                                                            <Text size="xs" c="dimmed" lineClamp={2}>
                                                                {pago.notas || 'Sin notas'}
                                                            </Text>
                                                        </Table.Td>
                                                    </Table.Tr>
                                                ))}
                                            </Table.Tbody>
                                        </Table>
                                    </Table.ScrollContainer>
                                ) : (
                                    <Alert icon={<IconInfoCircle size={16} />} title="Sin registros de pago" color="blue">
                                        Aún no has registrado ningún pago. Puedes reportar una transferencia o pago en efectivo haciendo clic en "Reportar Pago".
                                    </Alert>
                                )}
                            </Card>
                        </Stack>
                    </Tabs.Panel>

                    {/* PESTAÑA 3: INCIDENCIAS */}
                    <Tabs.Panel value="incidencias">
                        <Stack gap="md">
                            <Group justify="space-between" align="center">
                                <Stack gap={2}>
                                    <Title order={4} fw={600}>Reporte y Seguimiento de Incidencias</Title>
                                    <Text size="sm" c="dimmed">Informa a la administración sobre fallas, fugas o requerimientos de mantenimiento</Text>
                                </Stack>
                                <Button
                                    variant="filled"
                                    color="blue"
                                    leftSection={<IconPlus size={16} />}
                                    onClick={openIncidencia}
                                >
                                    Nueva Incidencia
                                </Button>
                            </Group>

                            {incidencias.length > 0 ? (
                                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                                    {incidencias.map((inc) => (
                                        <Card key={inc.id} withBorder radius="lg" padding="md" shadow="xs">
                                            <Stack gap="xs">
                                                <Group justify="space-between" align="flex-start">
                                                    <Stack gap={2}>
                                                        <Group gap={6} align="center">
                                                            <Title order={5} fw={600}>{inc.titulo}</Title>
                                                            {getPrioridadBadge(inc.prioridad)}
                                                        </Group>
                                                        <Text size="xs" c="dimmed">
                                                            {inc.categoria ? `Categoría: ${inc.categoria}` : 'Sin categoría'} · {inc.lugar}
                                                        </Text>
                                                    </Stack>
                                                    {getEstadoBadge(inc.estado)}
                                                </Group>

                                                <Text size="sm" c="dimmed" lineClamp={3}>
                                                    {inc.descripcion}
                                                </Text>

                                                {inc.comentario && (
                                                    <Alert color="blue" variant="light" title="Respuesta del Administrador" p="xs">
                                                        <Text size="xs">{inc.comentario}</Text>
                                                    </Alert>
                                                )}

                                                <Divider />
                                                <Group justify="space-between" align="center">
                                                    <Text size="xs" c="dimmed">Reportado el {inc.fechaReporte}</Text>
                                                </Group>
                                            </Stack>
                                        </Card>
                                    ))}
                                </SimpleGrid>
                            ) : (
                                <Card withBorder radius="lg" p="xl" shadow="sm">
                                    <Stack align="center" gap="sm">
                                        <ThemeIcon size={56} radius="xl" variant="light" color="blue">
                                            <IconCheck size={28} />
                                        </ThemeIcon>
                                        <Title order={4}>Todo en orden</Title>
                                        <Text size="sm" c="dimmed" ta="center">
                                            No tienes incidencias registradas en este momento. Si necesitas reportar una avería o requerimiento, haz clic en "Nueva Incidencia".
                                        </Text>
                                        <Button leftSection={<IconPlus size={16} />} onClick={openIncidencia}>
                                            Reportar Incidencia
                                        </Button>
                                    </Stack>
                                </Card>
                            )}
                        </Stack>
                    </Tabs.Panel>

                    {/* PESTAÑA 4: RESERVACIONES */}
                    <Tabs.Panel value="reservaciones">
                        <Stack gap="md">
                            <Group justify="space-between" align="center">
                                <Stack gap={2}>
                                    <Title order={4} fw={600}>Mis Reservaciones de Áreas Comunes</Title>
                                    <Text size="sm" c="dimmed">Solicita y consulta el estatus de uso de terrazas, salones y espacios de reunión</Text>
                                </Stack>
                                <Button
                                    variant="filled"
                                    color="cyan"
                                    leftSection={<IconCalendarPlus size={16} />}
                                    onClick={openReservacion}
                                >
                                    Nueva Reservación
                                </Button>
                            </Group>

                            {reservaciones.length > 0 ? (
                                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                                    {reservaciones.map((res) => (
                                        <Card key={res.id} withBorder radius="lg" padding="md" shadow="xs">
                                            <Stack gap="xs">
                                                <Group justify="space-between" align="flex-start">
                                                    <Stack gap={2}>
                                                        <Title order={5} fw={600}>{res.areaComun || 'Área Común'}</Title>
                                                        <Group gap="xs">
                                                            <Text size="xs" c="dimmed">
                                                                <IconCalendar size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                                                                {res.fecha}
                                                            </Text>
                                                            <Text size="xs" c="dimmed">
                                                                <IconClock size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                                                                {res.horaInicio} - {res.horaFin}
                                                            </Text>
                                                        </Group>
                                                    </Stack>
                                                    {getEstadoBadge(res.estado)}
                                                </Group>

                                                {res.motivo && (
                                                    <Text size="sm" c="dimmed">
                                                        Motivo: {res.motivo}
                                                    </Text>
                                                )}

                                                {res.numAsistentes && (
                                                    <Text size="xs" c="dimmed">
                                                        Asistentes estimados: {res.numAsistentes} personas
                                                    </Text>
                                                )}

                                                {res.motivoRechazo && (
                                                    <Alert color="red" variant="light" title="Motivo de rechazo" p="xs">
                                                        <Text size="xs">{res.motivoRechazo}</Text>
                                                    </Alert>
                                                )}
                                            </Stack>
                                        </Card>
                                    ))}
                                </SimpleGrid>
                            ) : (
                                <Card withBorder radius="lg" p="xl" shadow="sm">
                                    <Stack align="center" gap="sm">
                                        <ThemeIcon size={56} radius="xl" variant="light" color="cyan">
                                            <IconCalendarClock size={28} />
                                        </ThemeIcon>
                                        <Title order={4}>Sin reservaciones activas</Title>
                                        <Text size="sm" c="dimmed" ta="center">
                                            No tienes reservaciones programadas para áreas comunes. Puedes reservar terrazas o salas compartidas fácilmente.
                                        </Text>
                                        <Button leftSection={<IconCalendarPlus size={16} />} color="cyan" onClick={openReservacion}>
                                            Crear Reservación
                                        </Button>
                                    </Stack>
                                </Card>
                            )}
                        </Stack>
                    </Tabs.Panel>

                    {/* PESTAÑA 5: AVISOS */}
                    <Tabs.Panel value="avisos">
                        <Stack gap="md">
                            <Group justify="space-between" align="center">
                                <Stack gap={2}>
                                    <Title order={4} fw={600}>Avisos y Comunicados del Condominio</Title>
                                    <Text size="sm" c="dimmed">Mantente al tanto de comunicados oficiales, cortes programados y eventos</Text>
                                </Stack>
                                <Button
                                    component={Link}
                                    href="/avisos"
                                    variant="subtle"
                                    rightSection={<IconArrowRight size={16} />}
                                >
                                    Ver todos los avisos
                                </Button>
                            </Group>

                            {avisos.length > 0 ? (
                                <Stack gap="sm">
                                    {avisos.map((aviso) => (
                                        <Card key={aviso.id} withBorder radius="lg" padding="md" shadow="xs">
                                            <Group justify="space-between" align="flex-start" mb="xs">
                                                <Group gap="xs">
                                                    <ThemeIcon
                                                        radius="md"
                                                        variant="light"
                                                        color={
                                                            aviso.tipo === 'urgente'
                                                                ? 'red'
                                                                : aviso.tipo === 'mantenimiento'
                                                                ? 'orange'
                                                                : 'blue'
                                                        }
                                                    >
                                                        <IconBell size={18} />
                                                    </ThemeIcon>
                                                    <div>
                                                        <Group gap={6} align="center">
                                                            <Title order={5} fw={600}>
                                                                {aviso.titulo}
                                                            </Title>
                                                            {aviso.fijado && (
                                                                <Badge size="xs" color="yellow" variant="filled">
                                                                    Fijado
                                                                </Badge>
                                                            )}
                                                        </Group>
                                                        <Text size="xs" c="dimmed">
                                                            Publicado el {aviso.fechaPublicacion}
                                                            {aviso.fechaEvento ? ` · Evento programado: ${aviso.fechaEvento}` : ''}
                                                        </Text>
                                                    </div>
                                                </Group>
                                                <Badge
                                                    variant="light"
                                                    color={
                                                        aviso.tipo === 'urgente'
                                                            ? 'red'
                                                            : aviso.tipo === 'mantenimiento'
                                                            ? 'orange'
                                                            : 'blue'
                                                    }
                                                >
                                                    {aviso.tipo.toUpperCase()}
                                                </Badge>
                                            </Group>
                                            <Text size="sm" style={{ whiteSpace: 'pre-line' }}>
                                                {aviso.contenido}
                                            </Text>
                                        </Card>
                                    ))}
                                </Stack>
                            ) : (
                                <Alert icon={<IconInfoCircle size={16} />} title="Sin avisos recientes" color="blue">
                                    No hay avisos pendientes para mostrar en este momento.
                                </Alert>
                            )}
                        </Stack>
                    </Tabs.Panel>
                </Tabs>
            </Stack>

            {/* MODAL: REPORTAR INCIDENCIA */}
            <Modal
                opened={incidenciaOpened}
                onClose={closeIncidencia}
                title={<Title order={4} fw={600}>Reportar Nueva Incidencia</Title>}
                size="lg"
                radius="md"
            >
                <form onSubmit={handleCreateIncidencia}>
                    <Stack gap="md">
                        <TextInput
                            label="Título breve"
                            placeholder="Ej. Fuga de agua en el lavamanos, lámpara parpadea..."
                            required
                            value={incidenciaForm.titulo}
                            onChange={(e) => setIncidenciaForm({ ...incidenciaForm, titulo: e.target.value })}
                        />

                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                            <Select
                                label="Categoría"
                                placeholder="Selecciona una categoría"
                                required
                                data={catalogos.categoriasIncidencia}
                                value={incidenciaForm.categoria_id}
                                onChange={(val) => setIncidenciaForm({ ...incidenciaForm, categoria_id: val || '' })}
                            />
                            <Select
                                label="Prioridad"
                                required
                                data={[
                                    { value: 'baja', label: 'Baja' },
                                    { value: 'media', label: 'Media' },
                                    { value: 'alta', label: 'Alta' },
                                    { value: 'urgente', label: 'Urgente' },
                                ]}
                                value={incidenciaForm.prioridad}
                                onChange={(val) => setIncidenciaForm({ ...incidenciaForm, prioridad: val || 'media' })}
                            />
                        </SimpleGrid>

                        <Select
                            label="Ubicación de la incidencia"
                            data={[
                                { value: 'local', label: local ? `Mi local (${local.codigo} - ${local.nombre})` : 'Mi Local' },
                                { value: 'area_comun', label: 'Área común del condominio' },
                            ]}
                            value={incidenciaForm.destino}
                            onChange={(val) => setIncidenciaForm({ ...incidenciaForm, destino: val || 'local' })}
                        />

                        {incidenciaForm.destino === 'area_comun' && (
                            <Select
                                label="Selecciona el área común"
                                placeholder="Elige el área afectada"
                                data={catalogos.areasComunes}
                                value={incidenciaForm.area_comun_id}
                                onChange={(val) => setIncidenciaForm({ ...incidenciaForm, area_comun_id: val || '' })}
                            />
                        )}

                        <Textarea
                            label="Descripción detallada"
                            placeholder="Explica qué ocurrió, dónde se encuentra y cualquier detalle relevante para el personal técnico..."
                            required
                            minRows={3}
                            value={incidenciaForm.descripcion}
                            onChange={(e) => setIncidenciaForm({ ...incidenciaForm, descripcion: e.target.value })}
                        />

                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={closeIncidencia}>
                                Cancelar
                            </Button>
                            <Button type="submit" color="blue" loading={isSubmittingIncidencia}>
                                Enviar Reporte
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>

            {/* MODAL: NUEVA RESERVACIÓN */}
            <Modal
                opened={reservacionOpened}
                onClose={closeReservacion}
                title={<Title order={4} fw={600}>Reservar Área Común</Title>}
                size="md"
                radius="md"
            >
                <form onSubmit={handleCreateReservacion}>
                    <Stack gap="md">
                        <Select
                            label="Área Común"
                            placeholder="Selecciona el área a reservar"
                            required
                            data={catalogos.areasComunes}
                            value={reservacionForm.areaComunId}
                            onChange={(val) => setReservacionForm({ ...reservacionForm, areaComunId: val || '' })}
                        />

                        <TextInput
                            label="Fecha de la reservación"
                            type="date"
                            required
                            value={reservacionForm.fecha}
                            onChange={(e) => setReservacionForm({ ...reservacionForm, fecha: e.target.value })}
                        />

                        <SimpleGrid cols={2} spacing="md">
                            <TextInput
                                label="Hora de inicio"
                                type="time"
                                required
                                value={reservacionForm.horaInicio}
                                onChange={(e) => setReservacionForm({ ...reservacionForm, horaInicio: e.target.value })}
                            />
                            <TextInput
                                label="Hora de fin"
                                type="time"
                                required
                                value={reservacionForm.horaFin}
                                onChange={(e) => setReservacionForm({ ...reservacionForm, horaFin: e.target.value })}
                            />
                        </SimpleGrid>

                        <NumberInput
                            label="Número estimado de asistentes"
                            min={1}
                            max={500}
                            value={reservacionForm.numAsistentes}
                            onChange={(val) => setReservacionForm({ ...reservacionForm, numAsistentes: Number(val) || 1 })}
                        />

                        <Textarea
                            label="Motivo o propósito (opcional)"
                            placeholder="Ej. Reunión de equipo, festejo comercial..."
                            value={reservacionForm.motivo}
                            onChange={(e) => setReservacionForm({ ...reservacionForm, motivo: e.target.value })}
                        />

                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={closeReservacion}>
                                Cancelar
                            </Button>
                            <Button type="submit" color="cyan" loading={isSubmittingReservacion}>
                                Solicitar Reservación
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>

            {/* MODAL: REPORTAR PAGO */}
            <Modal
                opened={pagoOpened}
                onClose={closePago}
                title={<Title order={4} fw={600}>Reportar Pago Realizado</Title>}
                size="md"
                radius="md"
            >
                <form onSubmit={handleCreatePago}>
                    <Stack gap="md">
                        <Select
                            label="Local correspondiente"
                            required
                            data={catalogos.locales}
                            value={pagoForm.localId}
                            onChange={(val) => setPagoForm({ ...pagoForm, localId: val || '' })}
                        />

                        <SimpleGrid cols={2} spacing="md">
                            <NumberInput
                                label="Monto pagado ($)"
                                required
                                min={1}
                                decimalScale={2}
                                value={pagoForm.monto}
                                onChange={(val) => setPagoForm({ ...pagoForm, monto: Number(val) || 0 })}
                            />
                            <TextInput
                                label="Fecha de pago"
                                type="date"
                                required
                                value={pagoForm.fechaPago}
                                onChange={(e) => setPagoForm({ ...pagoForm, fechaPago: e.target.value })}
                            />
                        </SimpleGrid>

                        <TextInput
                            label="Referencia o enlace del comprobante"
                            placeholder="Ej. Folio bancario 98234 o enlace"
                            value={pagoForm.comprobanteUrl}
                            onChange={(e) => setPagoForm({ ...pagoForm, comprobanteUrl: e.target.value })}
                        />

                        <Textarea
                            label="Notas u observaciones"
                            placeholder="Detalles sobre el banco, transferencia o concepto del pago..."
                            value={pagoForm.notas}
                            onChange={(e) => setPagoForm({ ...pagoForm, notas: e.target.value })}
                        />

                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={closePago}>
                                Cancelar
                            </Button>
                            <Button type="submit" color="teal" loading={isSubmittingPago}>
                                Registrar Pago
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </>
    );
}

