import { useMemo, useState } from 'react';
import {
    ActionIcon, Badge, Box, Button, Card, Center, Checkbox, Drawer, Flex, Grid,
    Group, Menu, Modal, MultiSelect, NumberInput, Select, SimpleGrid, Stack,
    Switch, Table, Text, Textarea, TextInput, ThemeIcon, Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Head, router, useForm } from '@inertiajs/react';
import {
    IconAlertCircle, IconBuilding, IconCalendar, IconCalendarClock, IconCheck,
    IconClock, IconDotsVertical, IconEye, IconLock, IconPencil, IconPlus,
    IconTrash, IconUsers, IconX,
} from '@tabler/icons-react';
import ReservacionController from '@/actions/App/Http/Controllers/ReservacionController';
import AreaComunController from '@/actions/App/Http/Controllers/AreaComunController';
import { TittlePage } from '@/matine-components/tittle-page';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

/** Forma que entrega App\Http\Resources\AreaComunResource */
export interface AreaComunData {
    id: number;
    nombre: string;
    descripcion: string | null;
    capacidad: number | null;
    horaApertura: string;
    horaCierre: string;
    reservable: boolean;
    requiereAprobacion: boolean;
    reglas: string | null;
    reservacionesCount: number;
}

/** Forma que entrega App\Http\Resources\ReservacionResource */
export interface ReservacionData {
    id: number;
    areaComunId: number;
    areaComunNombre: string;
    usuarioId: number;
    usuarioNombre: string;
    usuarioEmail: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    numAsistentes: number | null;
    motivo: string | null;
    estado: 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada';
    motivoRechazo: string | null;
    adminNombre: string | null;
    createdAt: string;
}

/** Campos del formulario de reservación */
type ReservacionForm = {
    areaComunId: number | string;
    usuarioId: number | string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    numAsistentes: number | string;
    motivo: string;
    estado: ReservacionData['estado'];
    motivoRechazo: string;
};

/** Campos del formulario de área común */
type AreaComunForm = {
    nombre: string;
    descripcion: string;
    capacidad: number | string;
    horaApertura: string;
    horaCierre: string;
    reservable: boolean;
    requiereAprobacion: boolean;
    reglas: string;
};

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const ESTADOS_RESERVACION: ReservacionData['estado'][] = ['pendiente', 'aprobada', 'rechazada', 'cancelada'];

const estadoColor: Record<ReservacionData['estado'], string> = {
    pendiente: 'yellow',
    aprobada: 'green',
    rechazada: 'red',
    cancelada: 'gray',
};

const getEstadoBadge = (estado: ReservacionData['estado']) => (
    <Badge color={estadoColor[estado]} variant="light">{estado.charAt(0).toUpperCase() + estado.slice(1)}</Badge>
);

const emptyReservacion: ReservacionForm = {
    areaComunId: '',
    usuarioId: '',
    fecha: '',
    horaInicio: '',
    horaFin: '',
    numAsistentes: '',
    motivo: '',
    estado: 'pendiente',
    motivoRechazo: '',
};

const toReservacionForm = (r: ReservacionData): ReservacionForm => ({
    areaComunId: r.areaComunId,
    usuarioId: r.usuarioId,
    fecha: r.fecha,
    horaInicio: r.horaInicio,
    horaFin: r.horaFin,
    numAsistentes: r.numAsistentes ?? '',
    motivo: r.motivo ?? '',
    estado: r.estado,
    motivoRechazo: r.motivoRechazo ?? '',
});

const emptyAreaComun: AreaComunForm = {
    nombre: '',
    descripcion: '',
    capacidad: '',
    horaApertura: '08:00',
    horaCierre: '22:00',
    reservable: true,
    requiereAprobacion: false,
    reglas: '',
};

const toAreaComunForm = (a: AreaComunData): AreaComunForm => ({
    nombre: a.nombre,
    descripcion: a.descripcion ?? '',
    capacidad: a.capacidad ?? '',
    horaApertura: a.horaApertura,
    horaCierre: a.horaCierre,
    reservable: a.reservable,
    requiereAprobacion: a.requiereAprobacion,
    reglas: a.reglas ?? '',
});

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function ReservacionesPage({
    reservaciones,
    areas,
    usuarios,
}: {
    reservaciones: ReservacionData[];
    areas: AreaComunData[];
    usuarios: { id: number; name: string; email: string }[];
}) {
    // --- Pestaña activa ---
    const [activeTab, setActiveTab] = useState<'reservaciones' | 'areas'>('reservaciones');

    // --- Selección ---
    const [selection, setSelection] = useState<number[]>([]);

    // --- Filtros reservaciones ---
    const [searchRes, setSearchRes] = useState('');
    const [filterEstado, setFilterEstado] = useState<string[]>([]);
    const [filterArea, setFilterArea] = useState<string[]>([]);

    // --- Filtros áreas ---
    const [searchArea, setSearchArea] = useState('');

    // --- Modales ---
    const [resModalOpened, { open: openResModal, close: closeResModal }] = useDisclosure(false);
    const [areaModalOpened, { open: openAreaModal, close: closeAreaModal }] = useDisclosure(false);
    const [detailDrawerOpened, { open: openDetailDrawer, close: closeDetailDrawer }] = useDisclosure(false);

    // --- Estado de edición ---
    const [editingResId, setEditingResId] = useState<number | null>(null);
    const [editingAreaId, setEditingAreaId] = useState<number | null>(null);
    const [selectedResId, setSelectedResId] = useState<number | null>(null);
    const selectedRes = reservaciones.find((r) => r.id === selectedResId) ?? null;

    // --- Formularios ---
    const resForm = useForm<ReservacionForm>(emptyReservacion);
    const areaForm = useForm<AreaComunForm>(emptyAreaComun);

    // --- Opciones de selects ---
    const areaOptions = areas.map((a) => ({ value: String(a.id), label: a.nombre }));
    const usuarioOptions = usuarios.map((u) => ({ value: String(u.id), label: `${u.name} (${u.email})` }));
    const estadoOptions = ESTADOS_RESERVACION.map((e) => ({ value: e, label: e.charAt(0).toUpperCase() + e.slice(1) }));
    const areaFilterOptions = areas.map((a) => ({ value: String(a.id), label: a.nombre }));

    // --- Estadísticas ---
    const stats = useMemo(() => {
        const hoy = new Date().toISOString().split('T')[0];
        return {
            total: reservaciones.length,
            pendientes: reservaciones.filter((r) => r.estado === 'pendiente').length,
            aprobadas: reservaciones.filter((r) => r.estado === 'aprobada').length,
            hoy: reservaciones.filter((r) => r.fecha === hoy).length,
        };
    }, [reservaciones]);

    // --- Filtrado reservaciones ---
    const filteredRes = useMemo(() => {
        const q = searchRes.toLowerCase();
        return reservaciones.filter((r) => {
            const matchSearch =
                q === '' ||
                r.areaComunNombre.toLowerCase().includes(q) ||
                r.usuarioNombre.toLowerCase().includes(q) ||
                r.fecha.includes(q);
            const matchEstado = filterEstado.length === 0 || filterEstado.includes(r.estado);
            const matchArea = filterArea.length === 0 || filterArea.includes(String(r.areaComunId));
            return matchSearch && matchEstado && matchArea;
        });
    }, [reservaciones, searchRes, filterEstado, filterArea]);

    // --- Filtrado áreas ---
    const filteredAreas = useMemo(() => {
        const q = searchArea.toLowerCase();
        return areas.filter(
            (a) => q === '' || a.nombre.toLowerCase().includes(q) || (a.descripcion?.toLowerCase().includes(q) ?? false)
        );
    }, [areas, searchArea]);

    // --- Selección ---
    const toggleRow = (id: number) =>
        setSelection((cur) => (cur.includes(id) ? cur.filter((i) => i !== id) : [...cur, id]));
    const toggleAll = () =>
        setSelection((cur) => (cur.length === filteredRes.length ? [] : filteredRes.map((r) => r.id)));

    // --- Handlers reservaciones ---
    const handleOpenCreateRes = () => {
        setEditingResId(null);
        resForm.clearErrors();
        resForm.setData(emptyReservacion);
        openResModal();
    };

    const handleOpenEditRes = (r: ReservacionData) => {
        setEditingResId(r.id);
        resForm.clearErrors();
        resForm.setData(toReservacionForm(r));
        openResModal();
    };

    const handleViewDetail = (r: ReservacionData) => {
        setSelectedResId(r.id);
        openDetailDrawer();
    };

    const handleSubmitRes = () => {
        resForm.submit(
            editingResId === null ? ReservacionController.store() : ReservacionController.update(editingResId),
            {
                preserveScroll: true,
                onSuccess: () => { closeResModal(); resForm.reset(); },
            }
        );
    };

    const handleDeleteRes = (r: ReservacionData) => {
        if (!window.confirm(`¿Eliminar la reservación de ${r.usuarioNombre} en ${r.areaComunNombre}?`)) return;
        router.delete(ReservacionController.destroy(r.id), {
            preserveScroll: true,
            onSuccess: () => setSelection((cur) => cur.filter((id) => id !== r.id)),
        });
    };

    const handleDeleteManyRes = () => {
        if (!window.confirm(`¿Eliminar ${selection.length} reservaciones?`)) return;
        router.delete(ReservacionController.destroyMany(), {
            data: { ids: selection },
            preserveScroll: true,
            onSuccess: () => setSelection([]),
        });
    };

    const handleApproveSelected = () => {
        router.patch(
            ReservacionController.updateStatus(),
            { ids: selection, estado: 'aprobada' },
            { preserveScroll: true, onSuccess: () => setSelection([]) }
        );
    };

    const handleRejectSelected = () => {
        router.patch(
            ReservacionController.updateStatus(),
            { ids: selection, estado: 'rechazada' },
            { preserveScroll: true, onSuccess: () => setSelection([]) }
        );
    };

    // --- Handlers áreas ---
    const handleOpenCreateArea = () => {
        setEditingAreaId(null);
        areaForm.clearErrors();
        areaForm.setData(emptyAreaComun);
        openAreaModal();
    };

    const handleOpenEditArea = (a: AreaComunData) => {
        setEditingAreaId(a.id);
        areaForm.clearErrors();
        areaForm.setData(toAreaComunForm(a));
        openAreaModal();
    };

    const handleSubmitArea = () => {
        areaForm.submit(
            editingAreaId === null ? AreaComunController.store() : AreaComunController.update(editingAreaId),
            {
                preserveScroll: true,
                onSuccess: () => { closeAreaModal(); areaForm.reset(); },
            }
        );
    };

    const handleDeleteArea = (a: AreaComunData) => {
        if (!window.confirm(`¿Eliminar el área "${a.nombre}"? Esta acción no se puede deshacer.`)) return;
        router.delete(AreaComunController.destroy(a.id), { preserveScroll: true });
    };

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------
    return (
        <>
            <Head title="Reservaciones" />

            <Stack gap="xl" p="md" w="100%" h="100%">

                {/* Encabezado */}
                <Flex justify="space-between" align="center" wrap="wrap" gap="md">
                    <TittlePage
                        title="Reservaciones y Áreas Comunes"
                        message="Gestiona las reservaciones y configura las áreas comunes del condominio"
                        icon={<IconCalendarClock size={40} color="var(--mantine-color-blue-8)" />}
                    />
                    <Group gap="sm">
                        <Button
                            leftSection={<IconPlus size={18} />}
                            color="blue"
                            radius="md"
                            onClick={handleOpenCreateRes}
                        >
                            Nueva Reservación
                        </Button>
                        <Button
                            leftSection={<IconPlus size={18} />}
                            variant="outline"
                            color="blue"
                            radius="md"
                            onClick={handleOpenCreateArea}
                        >
                            Nueva Área
                        </Button>
                    </Group>
                </Flex>

                {/* Tarjetas de estadísticas */}
                <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
                    <Card withBorder radius="md" padding="md">
                        <Group justify="space-between" align="center">
                            <Box>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total</Text>
                                <Title order={3} fw={700} mt={4}>{stats.total}</Title>
                                <Text size="xs" c="dimmed" mt={2}>Reservaciones</Text>
                            </Box>
                            <ThemeIcon color="blue" variant="light" size="xl" radius="md">
                                <IconCalendar size={24} />
                            </ThemeIcon>
                        </Group>
                    </Card>
                    <Card withBorder radius="md" padding="md">
                        <Group justify="space-between" align="center">
                            <Box>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Pendientes</Text>
                                <Title order={3} fw={700} mt={4} c="yellow">{stats.pendientes}</Title>
                                <Text size="xs" c="dimmed" mt={2}>Por aprobar</Text>
                            </Box>
                            <ThemeIcon color="yellow" variant="light" size="xl" radius="md">
                                <IconClock size={24} />
                            </ThemeIcon>
                        </Group>
                    </Card>
                    <Card withBorder radius="md" padding="md">
                        <Group justify="space-between" align="center">
                            <Box>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Aprobadas</Text>
                                <Title order={3} fw={700} mt={4} c="green">{stats.aprobadas}</Title>
                                <Text size="xs" c="dimmed" mt={2}>Confirmadas</Text>
                            </Box>
                            <ThemeIcon color="green" variant="light" size="xl" radius="md">
                                <IconCheck size={24} />
                            </ThemeIcon>
                        </Group>
                    </Card>
                    <Card withBorder radius="md" padding="md">
                        <Group justify="space-between" align="center">
                            <Box>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Hoy</Text>
                                <Title order={3} fw={700} mt={4} c="orange">{stats.hoy}</Title>
                                <Text size="xs" c="dimmed" mt={2}>Reservaciones del día</Text>
                            </Box>
                            <ThemeIcon color="orange" variant="light" size="xl" radius="md">
                                <IconCalendarClock size={24} />
                            </ThemeIcon>
                        </Group>
                    </Card>
                </SimpleGrid>

                {/* Pestañas */}
                <Group gap={0} w={'100%'}>
                    <Button
                        variant={activeTab === 'reservaciones' ? 'filled' : 'subtle'}
                        color="blue"
                        radius={0}
                        style={{ borderRadius: '8px 0 0 8px' }}
                        onClick={() => { setActiveTab('reservaciones'); setSelection([]); }}
                    >
                        <IconCalendar size={16} style={{ marginRight: 6 }} />
                        Reservaciones
                    </Button>
                    <Button
                        variant={activeTab === 'areas' ? 'filled' : 'subtle'}
                        color="blue"
                        radius={0}
                        style={{ borderRadius: '0 8px 8px 0' }}
                        onClick={() => setActiveTab('areas')}
                    >
                        <IconBuilding size={16} style={{ marginRight: 6 }} />
                        Áreas Comunes
                    </Button>
                </Group>

                {/* ===================== TABLA RESERVACIONES ===================== */}
                {activeTab === 'reservaciones' && (
                    <Stack gap="md">
                        {/* Filtros */}
                        <Card withBorder radius="md" padding="md">
                            <Grid align="center" gap="md">
                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <TextInput
                                        placeholder="Buscar por área, usuario o fecha…"
                                        leftSection={<IconCalendar size={16} />}
                                        value={searchRes}
                                        onChange={(e) => setSearchRes(e.currentTarget.value)}
                                        rightSection={
                                            searchRes ? (
                                                <ActionIcon size="xs" variant="subtle" onClick={() => setSearchRes('')}>
                                                    <IconX size={12} />
                                                </ActionIcon>
                                            ) : null
                                        }
                                    />
                                </Grid.Col>
                                <Grid.Col span={{ base: 6, md: 4 }}>
                                    <MultiSelect
                                        placeholder="Estado"
                                        clearable
                                        value={filterEstado}
                                        onChange={setFilterEstado}
                                        data={estadoOptions}
                                    />
                                </Grid.Col>
                                <Grid.Col span={{ base: 6, md: 4 }}>
                                    <MultiSelect
                                        placeholder="Área común"
                                        clearable
                                        searchable
                                        value={filterArea}
                                        onChange={setFilterArea}
                                        data={areaFilterOptions}
                                    />
                                </Grid.Col>
                            </Grid>
                        </Card>

                        {/* Tabla */}
                        <Card withBorder radius="md" padding="lg" w="100%">
                            <Table.ScrollContainer minWidth={800} maxHeight={600}>
                                <Table striped highlightOnHover verticalSpacing="sm">
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th w={40}>
                                                <Checkbox
                                                    aria-label="Seleccionar todas"
                                                    checked={selection.length > 0 && selection.length === filteredRes.length}
                                                    indeterminate={selection.length > 0 && selection.length !== filteredRes.length}
                                                    onChange={toggleAll}
                                                />
                                            </Table.Th>
                                            <Table.Th>Área Común</Table.Th>
                                            <Table.Th>Usuario</Table.Th>
                                            <Table.Th>Fecha</Table.Th>
                                            <Table.Th>Horario</Table.Th>
                                            <Table.Th>Asistentes</Table.Th>
                                            <Table.Th>Motivo</Table.Th>
                                            <Table.Th>Estado</Table.Th>
                                            <Table.Th ta="center">Acciones</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {filteredRes.length === 0 ? (
                                            <Table.Tr>
                                                <Table.Td colSpan={9} ta="center" py="xl">
                                                    <Flex direction="column" align="center" gap="xs">
                                                        <IconAlertCircle size={32} color="gray" />
                                                        <Text c="dimmed">No se encontraron reservaciones con los filtros seleccionados.</Text>
                                                    </Flex>
                                                </Table.Td>
                                            </Table.Tr>
                                        ) : (
                                            filteredRes.map((r) => (
                                                <Table.Tr key={r.id}>
                                                    <Table.Td>
                                                        <Checkbox
                                                            checked={selection.includes(r.id)}
                                                            onChange={() => toggleRow(r.id)}
                                                        />
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Text fw={600} size="sm">{r.areaComunNombre}</Text>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Text size="sm" fw={500}>{r.usuarioNombre}</Text>
                                                        <Text size="xs" c="dimmed">{r.usuarioEmail}</Text>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Text size="sm">{r.fecha}</Text>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Text size="sm">{r.horaInicio} – {r.horaFin}</Text>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Text size="sm">{r.numAsistentes ?? '—'}</Text>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Text size="sm" lineClamp={1}>{r.motivo ?? '—'}</Text>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Center>{getEstadoBadge(r.estado)}</Center>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Group gap="xs" justify="center">
                                                            <ActionIcon variant="subtle" color="blue" onClick={() => handleViewDetail(r)} title="Ver detalles">
                                                                <IconEye size={16} />
                                                            </ActionIcon>
                                                            <ActionIcon variant="subtle" color="yellow" onClick={() => handleOpenEditRes(r)} title="Editar">
                                                                <IconPencil size={16} />
                                                            </ActionIcon>
                                                            <Menu position="bottom-end" shadow="md">
                                                                <Menu.Target>
                                                                    <ActionIcon variant="subtle" color="gray">
                                                                        <IconDotsVertical size={16} />
                                                                    </ActionIcon>
                                                                </Menu.Target>
                                                                <Menu.Dropdown>
                                                                    <Menu.Item leftSection={<IconEye size={14} />} onClick={() => handleViewDetail(r)}>
                                                                        Ver detalles
                                                                    </Menu.Item>
                                                                    <Menu.Item leftSection={<IconCheck size={14} />} color="green"
                                                                        onClick={() => router.patch(ReservacionController.updateStatus(), { ids: [r.id], estado: 'aprobada' }, { preserveScroll: true })}>
                                                                        Aprobar
                                                                    </Menu.Item>
                                                                    <Menu.Item leftSection={<IconX size={14} />} color="red"
                                                                        onClick={() => router.patch(ReservacionController.updateStatus(), { ids: [r.id], estado: 'rechazada' }, { preserveScroll: true })}>
                                                                        Rechazar
                                                                    </Menu.Item>
                                                                    <Menu.Divider />
                                                                    <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={() => handleDeleteRes(r)}>
                                                                        Eliminar
                                                                    </Menu.Item>
                                                                </Menu.Dropdown>
                                                            </Menu>
                                                        </Group>
                                                    </Table.Td>
                                                </Table.Tr>
                                            ))
                                        )}
                                    </Table.Tbody>
                                </Table>
                            </Table.ScrollContainer>
                        </Card>

                        {/* Barra de acciones masivas */}
                        {selection.length > 0 && (
                            <Card withBorder radius="md" padding="sm" bg="var(--mantine-color-blue-0)">
                                <Group gap="sm" justify="space-between" wrap="wrap">
                                    <Text size="sm" fw={500}>{selection.length} reservaciones seleccionadas</Text>
                                    <Group gap="sm">
                                        <Button size="xs" color="green" leftSection={<IconCheck size={14} />} onClick={handleApproveSelected}>
                                            Aprobar
                                        </Button>
                                        <Button size="xs" color="red" leftSection={<IconX size={14} />} onClick={handleRejectSelected}>
                                            Rechazar
                                        </Button>
                                        <Button size="xs" color="red" variant="outline" leftSection={<IconTrash size={14} />} onClick={handleDeleteManyRes}>
                                            Eliminar
                                        </Button>
                                        <Button size="xs" variant="subtle" onClick={() => setSelection([])}>
                                            Cancelar
                                        </Button>
                                    </Group>
                                </Group>
                            </Card>
                        )}
                    </Stack>
                )}

                {/* ===================== TABLA ÁREAS COMUNES ===================== */}
                {activeTab === 'areas' && (
                    <Stack gap="md">
                        {/* Buscador */}
                        <Card withBorder radius="md" padding="md">
                            <TextInput
                                placeholder="Buscar área por nombre o descripción…"
                                leftSection={<IconBuilding size={16} />}
                                value={searchArea}
                                onChange={(e) => setSearchArea(e.currentTarget.value)}
                                rightSection={
                                    searchArea ? (
                                        <ActionIcon size="xs" variant="subtle" onClick={() => setSearchArea('')}>
                                            <IconX size={12} />
                                        </ActionIcon>
                                    ) : null
                                }
                            />
                        </Card>

                        {/* Tabla */}
                        <Card withBorder radius="md" padding="lg" w="100%">
                            <Table.ScrollContainer minWidth={700} maxHeight={600}>
                                <Table striped highlightOnHover verticalSpacing="sm">
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Nombre</Table.Th>
                                            <Table.Th>Descripción</Table.Th>
                                            <Table.Th>Capacidad</Table.Th>
                                            <Table.Th>Horario</Table.Th>
                                            <Table.Th>Reservable</Table.Th>
                                            <Table.Th>Requiere aprobación</Table.Th>
                                            <Table.Th>Reservaciones</Table.Th>
                                            <Table.Th ta="center">Acciones</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {filteredAreas.length === 0 ? (
                                            <Table.Tr>
                                                <Table.Td colSpan={8} ta="center" py="xl">
                                                    <Flex direction="column" align="center" gap="xs">
                                                        <IconAlertCircle size={32} color="gray" />
                                                        <Text c="dimmed">No se encontraron áreas comunes.</Text>
                                                    </Flex>
                                                </Table.Td>
                                            </Table.Tr>
                                        ) : (
                                            filteredAreas.map((a) => (
                                                <Table.Tr key={a.id}>
                                                    <Table.Td>
                                                        <Text fw={600} size="sm">{a.nombre}</Text>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Text size="sm" lineClamp={2} c="dimmed">{a.descripcion ?? '—'}</Text>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Group gap={4}>
                                                            <IconUsers size={14} />
                                                            <Text size="sm">{a.capacidad ?? '—'}</Text>
                                                        </Group>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Text size="sm">{a.horaApertura} – {a.horaCierre}</Text>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Center>
                                                            <Badge color={a.reservable ? 'green' : 'gray'} variant="light">
                                                                {a.reservable ? 'Sí' : 'No'}
                                                            </Badge>
                                                        </Center>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Center>
                                                            {a.requiereAprobacion ? (
                                                                <Badge color="orange" variant="light" leftSection={<IconLock size={12} />}>
                                                                    Sí
                                                                </Badge>
                                                            ) : (
                                                                <Badge color="gray" variant="light">No</Badge>
                                                            )}
                                                        </Center>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Text size="sm" ta="center">{a.reservacionesCount}</Text>
                                                    </Table.Td>
                                                    <Table.Td>
                                                        <Group gap="xs" justify="center">
                                                            <ActionIcon variant="subtle" color="yellow" onClick={() => handleOpenEditArea(a)} title="Editar">
                                                                <IconPencil size={16} />
                                                            </ActionIcon>
                                                            <ActionIcon variant="subtle" color="red" onClick={() => handleDeleteArea(a)} title="Eliminar">
                                                                <IconTrash size={16} />
                                                            </ActionIcon>
                                                        </Group>
                                                    </Table.Td>
                                                </Table.Tr>
                                            ))
                                        )}
                                    </Table.Tbody>
                                </Table>
                            </Table.ScrollContainer>
                        </Card>
                    </Stack>
                )}
            </Stack>

            {/* ===================== MODAL RESERVACIÓN ===================== */}
            <Modal
                opened={resModalOpened}
                onClose={closeResModal}
                title={
                    <Group gap="xs">
                        <ThemeIcon color={editingResId === null ? 'blue' : 'yellow'} variant="light" size="md">
                            {editingResId === null ? <IconPlus size={16} /> : <IconPencil size={16} />}
                        </ThemeIcon>
                        <Text fw={600}>{editingResId === null ? 'Nueva Reservación' : 'Editar Reservación'}</Text>
                    </Group>
                }
                size="lg"
                radius="md"
            >
                <Stack gap="md">
                    <Grid gap="md">
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select
                                label="Área común"
                                required
                                searchable
                                data={areaOptions}
                                value={resForm.data.areaComunId ? String(resForm.data.areaComunId) : null}
                                error={resForm.errors.areaComunId}
                                onChange={(val) => resForm.setData('areaComunId', val ? Number(val) : '')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select
                                label="Usuario"
                                required
                                searchable
                                data={usuarioOptions}
                                value={resForm.data.usuarioId ? String(resForm.data.usuarioId) : null}
                                error={resForm.errors.usuarioId}
                                onChange={(val) => resForm.setData('usuarioId', val ? Number(val) : '')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                            <TextInput
                                label="Fecha"
                                type="date"
                                required
                                value={resForm.data.fecha}
                                error={resForm.errors.fecha}
                                onChange={(e) => resForm.setData('fecha', e.currentTarget.value)}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                            <TextInput
                                label="Hora inicio"
                                type="time"
                                required
                                value={resForm.data.horaInicio}
                                error={resForm.errors.horaInicio}
                                onChange={(e) => resForm.setData('horaInicio', e.currentTarget.value)}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                            <TextInput
                                label="Hora fin"
                                type="time"
                                required
                                value={resForm.data.horaFin}
                                error={resForm.errors.horaFin}
                                onChange={(e) => resForm.setData('horaFin', e.currentTarget.value)}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <NumberInput
                                label="Núm. asistentes"
                                min={1}
                                value={resForm.data.numAsistentes}
                                error={resForm.errors.numAsistentes}
                                onChange={(val) => resForm.setData('numAsistentes', val)}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select
                                label="Estado"
                                required
                                data={estadoOptions}
                                value={resForm.data.estado}
                                error={resForm.errors.estado}
                                onChange={(val) => resForm.setData('estado', (val as ReservacionData['estado']) ?? 'pendiente')}
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <TextInput
                                label="Motivo"
                                placeholder="Descripción breve del evento"
                                value={resForm.data.motivo}
                                error={resForm.errors.motivo}
                                onChange={(e) => resForm.setData('motivo', e.currentTarget.value)}
                            />
                        </Grid.Col>
                        {resForm.data.estado === 'rechazada' && (
                            <Grid.Col span={12}>
                                <TextInput
                                    label="Motivo de rechazo"
                                    required
                                    value={resForm.data.motivoRechazo}
                                    error={resForm.errors.motivoRechazo}
                                    onChange={(e) => resForm.setData('motivoRechazo', e.currentTarget.value)}
                                />
                            </Grid.Col>
                        )}
                    </Grid>
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={closeResModal}>Cancelar</Button>
                        <Button
                            color={editingResId === null ? 'blue' : 'yellow'}
                            onClick={handleSubmitRes}
                            loading={resForm.processing}
                        >
                            {editingResId === null ? 'Guardar' : 'Actualizar'}
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* ===================== MODAL ÁREA COMÚN ===================== */}
            <Modal
                opened={areaModalOpened}
                onClose={closeAreaModal}
                title={
                    <Group gap="xs">
                        <ThemeIcon color={editingAreaId === null ? 'blue' : 'yellow'} variant="light" size="md">
                            {editingAreaId === null ? <IconPlus size={16} /> : <IconPencil size={16} />}
                        </ThemeIcon>
                        <Text fw={600}>{editingAreaId === null ? 'Nueva Área Común' : 'Editar Área Común'}</Text>
                    </Group>
                }
                size="lg"
                radius="md"
            >
                <Stack gap="md">
                    <Grid gap="md">
                        <Grid.Col span={{ base: 12, sm: 8 }}>
                            <TextInput
                                label="Nombre"
                                required
                                placeholder="Ej: Terraza, Salón de usos múltiples"
                                value={areaForm.data.nombre}
                                error={areaForm.errors.nombre}
                                onChange={(e) => areaForm.setData('nombre', e.currentTarget.value)}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                            <NumberInput
                                label="Capacidad (personas)"
                                min={1}
                                value={areaForm.data.capacidad}
                                error={areaForm.errors.capacidad}
                                onChange={(val) => areaForm.setData('capacidad', val)}
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <TextInput
                                label="Descripción"
                                placeholder="Descripción breve del espacio"
                                value={areaForm.data.descripcion}
                                error={areaForm.errors.descripcion}
                                onChange={(e) => areaForm.setData('descripcion', e.currentTarget.value)}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <TextInput
                                label="Hora apertura"
                                type="time"
                                required
                                value={areaForm.data.horaApertura}
                                error={areaForm.errors.horaApertura}
                                onChange={(e) => areaForm.setData('horaApertura', e.currentTarget.value)}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <TextInput
                                label="Hora cierre"
                                type="time"
                                required
                                value={areaForm.data.horaCierre}
                                error={areaForm.errors.horaCierre}
                                onChange={(e) => areaForm.setData('horaCierre', e.currentTarget.value)}
                            />
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Textarea
                                label="Reglas de uso"
                                placeholder="Normas y restricciones del espacio…"
                                minRows={3}
                                value={areaForm.data.reglas}
                                error={areaForm.errors.reglas}
                                onChange={(e) => areaForm.setData('reglas', e.currentTarget.value)}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Switch
                                label="Reservable"
                                description="Permite que los residentes soliciten reservaciones."
                                checked={areaForm.data.reservable}
                                onChange={(e) => areaForm.setData('reservable', e.currentTarget.checked)}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Switch
                                label="Requiere aprobación"
                                description="El administrador debe aprobar cada solicitud."
                                checked={areaForm.data.requiereAprobacion}
                                onChange={(e) => areaForm.setData('requiereAprobacion', e.currentTarget.checked)}
                            />
                        </Grid.Col>
                    </Grid>
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={closeAreaModal}>Cancelar</Button>
                        <Button
                            color={editingAreaId === null ? 'blue' : 'yellow'}
                            onClick={handleSubmitArea}
                            loading={areaForm.processing}
                        >
                            {editingAreaId === null ? 'Guardar Área' : 'Actualizar Área'}
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* ===================== DRAWER DETALLE RESERVACIÓN ===================== */}
            <Drawer
                opened={detailDrawerOpened}
                onClose={closeDetailDrawer}
                title={selectedRes ? <Text fw={700} size="md">{selectedRes.areaComunNombre}</Text> : null}
                position="right"
                size="md"
                overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
            >
                {selectedRes && (
                    <Stack gap="lg" mt="md">
                        <Card withBorder radius="md" p="md">
                            <Group justify="space-between">
                                <Text size="xs" tt="uppercase" fw={700} c="dimmed">Estado</Text>
                                {getEstadoBadge(selectedRes.estado)}
                            </Group>
                            {selectedRes.motivoRechazo && (
                                <Text size="xs" c="red" mt="xs">Motivo de rechazo: {selectedRes.motivoRechazo}</Text>
                            )}
                        </Card>

                        <Card withBorder radius="md" p="md">
                            <Stack gap="xs">
                                <Flex align="center" gap="xs">
                                    <IconCalendar size={18} color="var(--mantine-color-blue-6)" />
                                    <Box>
                                        <Text size="xs" c="dimmed">Fecha</Text>
                                        <Text size="sm" fw={500}>{selectedRes.fecha}</Text>
                                    </Box>
                                </Flex>
                                <Flex align="center" gap="xs">
                                    <IconClock size={18} color="var(--mantine-color-blue-6)" />
                                    <Box>
                                        <Text size="xs" c="dimmed">Horario</Text>
                                        <Text size="sm" fw={500}>{selectedRes.horaInicio} – {selectedRes.horaFin}</Text>
                                    </Box>
                                </Flex>
                                <Flex align="center" gap="xs">
                                    <IconUsers size={18} color="var(--mantine-color-blue-6)" />
                                    <Box>
                                        <Text size="xs" c="dimmed">Asistentes</Text>
                                        <Text size="sm" fw={500}>{selectedRes.numAsistentes ?? '—'}</Text>
                                    </Box>
                                </Flex>
                                {selectedRes.motivo && (
                                    <Box>
                                        <Text size="xs" c="dimmed">Motivo</Text>
                                        <Text size="sm">{selectedRes.motivo}</Text>
                                    </Box>
                                )}
                            </Stack>
                        </Card>

                        <Card withBorder radius="md" p="md">
                            <Stack gap="xs">
                                <Text size="xs" tt="uppercase" fw={700} c="dimmed">Solicitante</Text>
                                <Text size="sm" fw={500}>{selectedRes.usuarioNombre}</Text>
                                <Text size="xs" c="dimmed">{selectedRes.usuarioEmail}</Text>
                            </Stack>
                        </Card>

                        {selectedRes.adminNombre && (
                            <Card withBorder radius="md" p="md">
                                <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="xs">Revisado por</Text>
                                <Text size="sm">{selectedRes.adminNombre}</Text>
                            </Card>
                        )}

                        <Group justify="flex-end">
                            <Button
                                variant="outline"
                                color="yellow"
                                leftSection={<IconPencil size={16} />}
                                onClick={() => {
                                    closeDetailDrawer();
                                    handleOpenEditRes(selectedRes);
                                }}
                            >
                                Editar
                            </Button>
                        </Group>
                    </Stack>
                )}
            </Drawer>
        </>
    );
}
