import { useState, useMemo } from 'react';
import {
    ActionIcon, Badge, Box, Button, Card, Center, Checkbox, Drawer, Flex, Grid, Group, Menu, Modal,
    NumberInput, Select, SimpleGrid, Stack, Table, Text, TextInput, Textarea, ThemeIcon, Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Head, router, useForm } from '@inertiajs/react';
import {
    IconAlertCircle, IconAlertTriangle, IconCalendar, IconCheck, IconClockPlay, IconDotsVertical,
    IconEye, IconFlame, IconMapPin, IconPencil, IconPlus, IconSearch, IconTrash, IconUser, IconUserCheck,
} from '@tabler/icons-react';
import IncidenciaController from '@/actions/App/Http/Controllers/IncidenciasController';
import { TittlePage } from '@/matine-components/tittle-page';

type Estado = 'abierta' | 'asignada' | 'en_proceso' | 'resuelta' | 'cerrada' | 'cancelada';
type Prioridad = 'baja' | 'media' | 'alta' | 'urgente';

// Forma que entrega App\Http\Resources\IncidenciaResource
export interface IncidenciaData {
    id: number;
    titulo: string;
    descripcion: string;
    categoria_id: number;
    categoria: string;
    local_id: number | null;
    local: string | null;
    area_comun_id: number | null;
    area_comun: string | null;
    prioridad: Prioridad;
    estado: Estado;
    comentario: string | null;
    usuario: string;
    admin_id: number | null;
    admin: string | null;
    fecha_reporte: string;
    fecha_asignacion: string | null;
    fecha_resolucion: string | null;
    costo_reparacion: number | null;
}

interface Option { id: number; label: string; activa?: boolean }

interface Props {
    incidencias: IncidenciaData[];
    categorias: Option[];
    locales: Option[];
    areasComunes: Option[];
    admins: Option[];
}

type UbicacionTipo = 'ninguna' | 'local' | 'area_comun';

// Campos que valida App\Http\Requests\IncidenciaRequest (+ ubicacion_tipo, solo de UI)
type IncidenciaForm = {
    titulo: string;
    descripcion: string;
    categoria_id: string | null;
    ubicacion_tipo: UbicacionTipo;
    local_id: string | null;
    area_comun_id: string | null;
    prioridad: Prioridad;
    estado: Estado;
    admin_id: string | null;
    comentario: string;
    costo_reparacion: number | string;
};

const emptyIncidencia: IncidenciaForm = {
    titulo: '',
    descripcion: '',
    categoria_id: null,
    ubicacion_tipo: 'ninguna',
    local_id: null,
    area_comun_id: null,
    prioridad: 'media',
    estado: 'abierta',
    admin_id: null,
    comentario: '',
    costo_reparacion: '',
};

const toForm = (i: IncidenciaData): IncidenciaForm => ({
    titulo: i.titulo,
    descripcion: i.descripcion,
    categoria_id: String(i.categoria_id),
    ubicacion_tipo: i.local_id ? 'local' : i.area_comun_id ? 'area_comun' : 'ninguna',
    local_id: i.local_id ? String(i.local_id) : null,
    area_comun_id: i.area_comun_id ? String(i.area_comun_id) : null,
    prioridad: i.prioridad,
    estado: i.estado,
    admin_id: i.admin_id ? String(i.admin_id) : null,
    comentario: i.comentario ?? '',
    costo_reparacion: i.costo_reparacion ?? '',
});

const ESTADOS: { value: Estado; label: string; color: string }[] = [
    { value: 'abierta', label: 'Abierta', color: 'blue' },
    { value: 'asignada', label: 'Asignada', color: 'cyan' },
    { value: 'en_proceso', label: 'En proceso', color: 'orange' },
    { value: 'resuelta', label: 'Resuelta', color: 'green' },
    { value: 'cerrada', label: 'Cerrada', color: 'gray' },
    { value: 'cancelada', label: 'Cancelada', color: 'red' },
];

const PRIORIDADES: { value: Prioridad; label: string; color: string }[] = [
    { value: 'baja', label: 'Baja', color: 'gray' },
    { value: 'media', label: 'Media', color: 'blue' },
    { value: 'alta', label: 'Alta', color: 'orange' },
    { value: 'urgente', label: 'Urgente', color: 'red' },
];

const UBICACIONES = [
    { value: 'ninguna', label: 'Sin ubicación específica' },
    { value: 'local', label: 'Local' },
    { value: 'area_comun', label: 'Área común' },
];

const EstadoBadge = ({ estado }: { estado: Estado }) => {
    const e = ESTADOS.find((x) => x.value === estado)!;
    return <Badge color={e.color} variant="light">{e.label}</Badge>;
};

const PrioridadBadge = ({ prioridad }: { prioridad: Prioridad }) => {
    const p = PRIORIDADES.find((x) => x.value === prioridad)!;
    return <Badge color={p.color} variant={prioridad === 'urgente' ? 'filled' : 'outline'}>{p.label}</Badge>;
};

const formatDate = (value: string | null) =>
    value
        ? new Date(value).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })
        : '—';

const formatMoney = (value: number | null) =>
    value === null ? '—' : `$${Number(value).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`;

const ubicacionLabel = (i: IncidenciaData) =>
    i.local ?? i.area_comun ?? 'Sin ubicación';

export default function IncidenciasPage({ incidencias, categorias, locales, areasComunes, admins }: Props) {
    const [selection, setSelection] = useState<number[]>([]);
    const [search, setSearch] = useState('');
    const [estadoFilter, setEstadoFilter] = useState<string | null>(null);
    const [prioridadFilter, setPrioridadFilter] = useState<string | null>(null);
    const [categoriaFilter, setCategoriaFilter] = useState<string | null>(null);

    const [createOpened, { open: openCreate, close: closeCreate }] = useDisclosure(false);
    const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
    const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);

    // Se guarda el id para que el drawer muestre los datos recargados del servidor.
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const selected = incidencias.find((i) => i.id === selectedId) ?? null;

    const createForm = useForm<IncidenciaForm>(emptyIncidencia);
    const editForm = useForm<IncidenciaForm>(emptyIncidencia);

    const categoriaData = (current: string | null) =>
        categorias
            .filter((c) => c.activa || String(c.id) === current)
            .map((c) => ({ value: String(c.id), label: c.activa ? c.label : `${c.label} (inactiva)` }));
    const localData = locales.map((l) => ({ value: String(l.id), label: l.label }));
    const areaData = areasComunes.map((a) => ({ value: String(a.id), label: a.label }));
    const adminData = admins.map((a) => ({ value: String(a.id), label: a.label }));

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return incidencias.filter((i) => {
            const matchesSearch =
                q === '' ||
                i.titulo.toLowerCase().includes(q) ||
                i.descripcion.toLowerCase().includes(q) ||
                i.usuario.toLowerCase().includes(q) ||
                (i.local?.toLowerCase().includes(q) ?? false) ||
                (i.area_comun?.toLowerCase().includes(q) ?? false);
            return (
                matchesSearch &&
                (!estadoFilter || i.estado === estadoFilter) &&
                (!prioridadFilter || i.prioridad === prioridadFilter) &&
                (!categoriaFilter || String(i.categoria_id) === categoriaFilter)
            );
        });
    }, [incidencias, search, estadoFilter, prioridadFilter, categoriaFilter]);

    const total = incidencias.length;
    const abiertas = incidencias.filter((i) => i.estado === 'abierta').length;
    const enAtencion = incidencias.filter((i) => ['asignada', 'en_proceso'].includes(i.estado)).length;
    const resueltas = incidencias.filter((i) => ['resuelta', 'cerrada'].includes(i.estado)).length;
    const urgentesActivas = incidencias.filter(
        (i) => i.prioridad === 'urgente' && !['resuelta', 'cerrada', 'cancelada'].includes(i.estado),
    ).length;

    const toggleRow = (id: number) =>
        setSelection((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

    const toggleAll = () =>
        setSelection((cur) => (cur.length === filtered.length ? [] : filtered.map((i) => i.id)));

    const handleViewDetail = (i: IncidenciaData) => {
        setSelectedId(i.id);
        openDetail();
    };

    const handleOpenEdit = (i: IncidenciaData) => {
        setSelectedId(i.id);
        editForm.clearErrors();
        editForm.setData(toForm(i));
        openEdit();
    };

    // Solo se envía la ubicación elegida y se descarta el campo auxiliar de UI.
    const cleanPayload = (data: IncidenciaForm) => {
        const { ubicacion_tipo, ...rest } = data;
        return {
            ...rest,
            local_id: ubicacion_tipo === 'local' ? rest.local_id : null,
            area_comun_id: ubicacion_tipo === 'area_comun' ? rest.area_comun_id : null,
            costo_reparacion: rest.costo_reparacion === '' ? null : rest.costo_reparacion,
        };
    };

    const handleCreate = () => {
        createForm.transform(cleanPayload as never);
        createForm.submit(IncidenciaController.store(), {
            preserveScroll: true,
            onSuccess: () => {
                closeCreate();
                createForm.reset();
            },
        });
    };

    const handleSaveEdit = () => {
        if (!selected) return;
        editForm.transform(cleanPayload as never);
        editForm.submit(IncidenciaController.update(selected.id), {
            preserveScroll: true,
            onSuccess: () => closeEdit(),
        });
    };

    const handleChangeEstado = (ids: number[], estado: Estado) => {
        router.patch(
            IncidenciaController.updateStatus(),
            { ids, estado },
            { preserveScroll: true, onSuccess: () => setSelection([]) },
        );
    };

    const handleDeleteSingle = (i: IncidenciaData) => {
        if (!window.confirm(`¿Eliminar la incidencia "${i.titulo}"? Esta acción no se puede deshacer.`)) return;
        router.delete(IncidenciaController.destroy(i.id), {
            preserveScroll: true,
            onSuccess: () => setSelection((prev) => prev.filter((id) => id !== i.id)),
        });
    };

    const handleDeleteSelected = () => {
        if (!window.confirm(`¿Eliminar ${selection.length} incidencias? Esta acción no se puede deshacer.`)) return;
        router.delete(IncidenciaController.destroyMany(), {
            data: { ids: selection },
            preserveScroll: true,
            onSuccess: () => setSelection([]),
        });
    };

    // Campos compartidos entre crear y editar
    const renderFields = (form: typeof createForm, isEdit: boolean) => (
        <Grid gap="md">
            <Grid.Col span={12}>
                <TextInput
                    label="Título"
                    placeholder="Ej: Fuga de agua en baño"
                    required
                    maxLength={120}
                    value={form.data.titulo}
                    error={form.errors.titulo}
                    onChange={(e) => form.setData('titulo', e.currentTarget.value)}
                />
            </Grid.Col>
            <Grid.Col span={12}>
                <Textarea
                    label="Descripción"
                    placeholder="Detalla el problema"
                    required
                    autosize
                    minRows={3}
                    value={form.data.descripcion}
                    error={form.errors.descripcion}
                    onChange={(e) => form.setData('descripcion', e.currentTarget.value)}
                />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
                <Select
                    label="Categoría"
                    required
                    searchable
                    data={categoriaData(form.data.categoria_id)}
                    value={form.data.categoria_id}
                    error={form.errors.categoria_id}
                    onChange={(val) => form.setData('categoria_id', val)}
                />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
                <Select
                    label="Prioridad"
                    allowDeselect={false}
                    data={PRIORIDADES.map(({ value, label }) => ({ value, label }))}
                    value={form.data.prioridad}
                    error={form.errors.prioridad}
                    onChange={(val) => form.setData('prioridad', (val as Prioridad) || 'media')}
                />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 6 }}>
                <Select
                    label="Ubicación"
                    allowDeselect={false}
                    data={UBICACIONES}
                    value={form.data.ubicacion_tipo}
                    onChange={(val) => form.setData('ubicacion_tipo', (val as UbicacionTipo) || 'ninguna')}
                />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}>
                {form.data.ubicacion_tipo === 'local' && (
                    <Select
                        label="Local"
                        searchable
                        data={localData}
                        value={form.data.local_id}
                        error={form.errors.local_id}
                        onChange={(val) => form.setData('local_id', val)}
                    />
                )}
                {form.data.ubicacion_tipo === 'area_comun' && (
                    <Select
                        label="Área común"
                        searchable
                        data={areaData}
                        value={form.data.area_comun_id}
                        error={form.errors.area_comun_id}
                        onChange={(val) => form.setData('area_comun_id', val)}
                    />
                )}
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: isEdit ? 6 : 12 }}>
                <Select
                    label="Asignar a"
                    placeholder="Sin asignar"
                    clearable
                    searchable
                    data={adminData}
                    value={form.data.admin_id}
                    error={form.errors.admin_id}
                    onChange={(val) => form.setData('admin_id', val)}
                />
            </Grid.Col>

            {isEdit && (
                <>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                        <Select
                            label="Estado"
                            allowDeselect={false}
                            data={ESTADOS.map(({ value, label }) => ({ value, label }))}
                            value={form.data.estado}
                            error={form.errors.estado}
                            onChange={(val) => form.setData('estado', (val as Estado) || 'abierta')}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                        <NumberInput
                            label="Costo de reparación ($)"
                            min={0}
                            step={100}
                            decimalScale={2}
                            fixedDecimalScale
                            thousandSeparator=","
                            value={form.data.costo_reparacion}
                            error={form.errors.costo_reparacion}
                            onChange={(val) => form.setData('costo_reparacion', val)}
                        />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                        <Textarea
                            label="Comentario del administrador"
                            autosize
                            minRows={2}
                            value={form.data.comentario}
                            error={form.errors.comentario}
                            onChange={(e) => form.setData('comentario', e.currentTarget.value)}
                        />
                    </Grid.Col>
                </>
            )}
        </Grid>
    );

    return (
        <>
            <Head title="Gestión de Incidencias" />

            <Stack gap="xl" p="md" w="100%" h="100%">
                <Flex justify="space-between" align="center" wrap="wrap" gap="md">
                    <TittlePage
                        title="Gestión de Incidencias"
                        message="Seguimiento, asignación y resolución de incidencias reportadas"
                        icon={<IconAlertTriangle size={40} color="var(--mantine-color-blue-8)" />}
                    />
                    <Button leftSection={<IconPlus size={18} />} color="blue" radius="md" onClick={openCreate}>
                        Nueva Incidencia
                    </Button>
                </Flex>

                {/* KPIs */}
                <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
                    <Card withBorder radius="md" padding="md">
                        <Group justify="space-between" align="center">
                            <Box>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Abiertas</Text>
                                <Title order={3} fw={700} mt={4} c="blue">{abiertas}</Title>
                                <Text size="xs" c="dimmed" mt={2}>De {total} en total</Text>
                            </Box>
                            <ThemeIcon color="blue" variant="light" size="xl" radius="md"><IconAlertCircle size={24} /></ThemeIcon>
                        </Group>
                    </Card>
                    <Card withBorder radius="md" padding="md">
                        <Group justify="space-between" align="center">
                            <Box>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>En atención</Text>
                                <Title order={3} fw={700} mt={4} c="orange">{enAtencion}</Title>
                                <Text size="xs" c="dimmed" mt={2}>Asignadas o en proceso</Text>
                            </Box>
                            <ThemeIcon color="orange" variant="light" size="xl" radius="md"><IconClockPlay size={24} /></ThemeIcon>
                        </Group>
                    </Card>
                    <Card withBorder radius="md" padding="md">
                        <Group justify="space-between" align="center">
                            <Box>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Resueltas</Text>
                                <Title order={3} fw={700} mt={4} c="green">{resueltas}</Title>
                                <Text size="xs" c="dimmed" mt={2}>Resueltas o cerradas</Text>
                            </Box>
                            <ThemeIcon color="green" variant="light" size="xl" radius="md"><IconCheck size={24} /></ThemeIcon>
                        </Group>
                    </Card>
                    <Card withBorder radius="md" padding="md">
                        <Group justify="space-between" align="center">
                            <Box>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Urgentes activas</Text>
                                <Title order={3} fw={700} mt={4} c="red">{urgentesActivas}</Title>
                                <Text size="xs" c="dimmed" mt={2}>Requieren atención inmediata</Text>
                            </Box>
                            <ThemeIcon color="red" variant="light" size="xl" radius="md"><IconFlame size={24} /></ThemeIcon>
                        </Group>
                    </Card>
                </SimpleGrid>

                {/* Filtros */}
                <Card withBorder radius="md" padding="md">
                    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
                        <TextInput
                            label="Buscar"
                            placeholder="Título, reportante, ubicación..."
                            leftSection={<IconSearch size={16} />}
                            value={search}
                            onChange={(e) => setSearch(e.currentTarget.value)}
                        />
                        <Select
                            label="Estado"
                            placeholder="Todos"
                            clearable
                            data={ESTADOS.map(({ value, label }) => ({ value, label }))}
                            value={estadoFilter}
                            onChange={setEstadoFilter}
                        />
                        <Select
                            label="Prioridad"
                            placeholder="Todas"
                            clearable
                            data={PRIORIDADES.map(({ value, label }) => ({ value, label }))}
                            value={prioridadFilter}
                            onChange={setPrioridadFilter}
                        />
                        <Select
                            label="Categoría"
                            placeholder="Todas"
                            clearable
                            searchable
                            data={categorias.map((c) => ({ value: String(c.id), label: c.label }))}
                            value={categoriaFilter}
                            onChange={setCategoriaFilter}
                        />
                    </SimpleGrid>
                </Card>

                {/* Acciones masivas */}
                {selection.length > 0 && (
                    <Card withBorder radius="md" padding="sm" bg="var(--mantine-color-blue-0)">
                        <Group justify="space-between" wrap="wrap">
                            <Text size="sm" fw={600}>{selection.length} incidencias seleccionadas</Text>
                            <Group gap="xs">
                                <Menu shadow="md">
                                    <Menu.Target>
                                        <Button size="xs" variant="light">Cambiar estado</Button>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                        {ESTADOS.map((e) => (
                                            <Menu.Item key={e.value} onClick={() => handleChangeEstado(selection, e.value)}>
                                                {e.label}
                                            </Menu.Item>
                                        ))}
                                    </Menu.Dropdown>
                                </Menu>
                                <Button size="xs" variant="light" color="red" leftSection={<IconTrash size={14} />} onClick={handleDeleteSelected}>
                                    Eliminar
                                </Button>
                                <Button size="xs" variant="default" onClick={() => setSelection([])}>Cancelar</Button>
                            </Group>
                        </Group>
                    </Card>
                )}

                {/* Tabla */}
                <Card withBorder radius="md" padding="lg" w="100%">
                    <Table.ScrollContainer minWidth={1000} maxHeight={600}>
                        <Table striped highlightOnHover verticalSpacing="sm">
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th w={40}>
                                        <Checkbox
                                            aria-label="Seleccionar todas"
                                            checked={selection.length > 0 && selection.length === filtered.length}
                                            indeterminate={selection.length > 0 && selection.length !== filtered.length}
                                            onChange={toggleAll}
                                        />
                                    </Table.Th>
                                    <Table.Th>Incidencia</Table.Th>
                                    <Table.Th>Categoría</Table.Th>
                                    <Table.Th>Ubicación</Table.Th>
                                    <Table.Th>Reportó</Table.Th>
                                    <Table.Th>Asignada a</Table.Th>
                                    <Table.Th ta="center">Prioridad</Table.Th>
                                    <Table.Th ta="center">Estado</Table.Th>
                                    <Table.Th ta="center">Acciones</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {filtered.length === 0 ? (
                                    <Table.Tr>
                                        <Table.Td colSpan={9} ta="center" py="xl">
                                            <Flex direction="column" align="center" gap="xs">
                                                <IconAlertCircle size={32} color="gray" />
                                                <Text c="dimmed">No se encontraron incidencias con los filtros seleccionados.</Text>
                                            </Flex>
                                        </Table.Td>
                                    </Table.Tr>
                                ) : (
                                    filtered.map((i) => (
                                        <Table.Tr key={i.id}>
                                            <Table.Td>
                                                <Checkbox checked={selection.includes(i.id)} onChange={() => toggleRow(i.id)} />
                                            </Table.Td>
                                            <Table.Td>
                                                <Text fw={600} size="sm" lineClamp={1}>{i.titulo}</Text>
                                                <Text size="xs" c="dimmed">{formatDate(i.fecha_reporte)}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge variant="outline" color="blue">{i.categoria}</Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm">{ubicacionLabel(i)}</Text>
                                                <Text size="xs" c="dimmed">
                                                    {i.local ? 'Local' : i.area_comun ? 'Área común' : ''}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td><Text size="sm">{i.usuario}</Text></Table.Td>
                                            <Table.Td>
                                                {i.admin ? (
                                                    <Text size="sm">{i.admin}</Text>
                                                ) : (
                                                    <Text size="xs" c="dimmed" fs="italic">Sin asignar</Text>
                                                )}
                                            </Table.Td>
                                            <Table.Td><Center><PrioridadBadge prioridad={i.prioridad} /></Center></Table.Td>
                                            <Table.Td><Center><EstadoBadge estado={i.estado} /></Center></Table.Td>
                                            <Table.Td>
                                                <Group gap="xs" justify="center" wrap="nowrap">
                                                    <ActionIcon variant="subtle" color="blue" onClick={() => handleViewDetail(i)} title="Ver detalles">
                                                        <IconEye size={16} />
                                                    </ActionIcon>
                                                    <ActionIcon variant="subtle" color="yellow" onClick={() => handleOpenEdit(i)} title="Editar">
                                                        <IconPencil size={16} />
                                                    </ActionIcon>
                                                    <Menu position="bottom-end" shadow="md">
                                                        <Menu.Target>
                                                            <ActionIcon variant="subtle" color="gray"><IconDotsVertical size={16} /></ActionIcon>
                                                        </Menu.Target>
                                                        <Menu.Dropdown>
                                                            <Menu.Item leftSection={<IconEye size={14} />} onClick={() => handleViewDetail(i)}>
                                                                Ver detalles
                                                            </Menu.Item>
                                                            <Menu.Item leftSection={<IconPencil size={14} />} onClick={() => handleOpenEdit(i)}>
                                                                Editar incidencia
                                                            </Menu.Item>
                                                            <Menu.Divider />
                                                            <Menu.Label>Cambiar estado</Menu.Label>
                                                            {ESTADOS.filter((e) => e.value !== i.estado).map((e) => (
                                                                <Menu.Item key={e.value} onClick={() => handleChangeEstado([i.id], e.value)}>
                                                                    {e.label}
                                                                </Menu.Item>
                                                            ))}
                                                            <Menu.Divider />
                                                            <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={() => handleDeleteSingle(i)}>
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
            </Stack>

            {/* Modal: Crear */}
            <Modal
                opened={createOpened}
                onClose={closeCreate}
                title={
                    <Group gap="xs">
                        <ThemeIcon color="blue" variant="light" size="md"><IconPlus size={16} /></ThemeIcon>
                        <Text fw={600}>Registrar Nueva Incidencia</Text>
                    </Group>
                }
                size="lg"
                radius="md"
            >
                <Stack gap="md">
                    {renderFields(createForm, false)}
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={closeCreate}>Cancelar</Button>
                        <Button color="blue" onClick={handleCreate} loading={createForm.processing}>Guardar Incidencia</Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Modal: Editar */}
            <Modal
                opened={editOpened}
                onClose={closeEdit}
                title={
                    <Group gap="xs">
                        <ThemeIcon color="yellow" variant="light" size="md"><IconPencil size={16} /></ThemeIcon>
                        <Text fw={600}>Editar Incidencia #{selected?.id}</Text>
                    </Group>
                }
                size="lg"
                radius="md"
            >
                <Stack gap="md">
                    {renderFields(editForm, true)}
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={closeEdit}>Cancelar</Button>
                        <Button color="yellow" onClick={handleSaveEdit} loading={editForm.processing}>Actualizar Incidencia</Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Drawer: Detalle */}
            <Drawer
                opened={detailOpened}
                onClose={closeDetail}
                title={
                    selected ? (
                        <Group gap="xs">
                            <Badge size="lg" color="blue" variant="filled">#{selected.id}</Badge>
                            <Text fw={700} size="md">{selected.titulo}</Text>
                        </Group>
                    ) : null
                }
                position="right"
                size="md"
                overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
            >
                {selected && (
                    <Stack gap="lg" mt="md">
                        <Card withBorder radius="md" p="md">
                            <Group justify="space-between" mb="xs">
                                <Text size="xs" tt="uppercase" fw={700} c="dimmed">Estado y prioridad</Text>
                                <Group gap="xs">
                                    <PrioridadBadge prioridad={selected.prioridad} />
                                    <EstadoBadge estado={selected.estado} />
                                </Group>
                            </Group>
                            <Text size="sm" c="dimmed">
                                Categoría: <Text span fw={600} c="dark">{selected.categoria}</Text>
                            </Text>
                        </Card>

                        <Box>
                            <Text fw={700} size="sm" mb="xs">Descripción</Text>
                            <Card withBorder radius="sm" p="sm">
                                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{selected.descripcion}</Text>
                            </Card>
                        </Box>

                        <Box>
                            <Text fw={700} size="sm" mb="xs">Detalles</Text>
                            <Card withBorder radius="md" p="md">
                                <Stack gap="xs">
                                    <Flex align="center" gap="xs">
                                        <IconMapPin size={18} color="var(--mantine-color-blue-6)" />
                                        <Box>
                                            <Text size="xs" c="dimmed">Ubicación</Text>
                                            <Text size="sm" fw={600}>{ubicacionLabel(selected)}</Text>
                                        </Box>
                                    </Flex>
                                    <Flex align="center" gap="xs">
                                        <IconUser size={18} color="var(--mantine-color-blue-6)" />
                                        <Box>
                                            <Text size="xs" c="dimmed">Reportada por</Text>
                                            <Text size="sm" fw={600}>{selected.usuario}</Text>
                                        </Box>
                                    </Flex>
                                    <Flex align="center" gap="xs">
                                        <IconUserCheck size={18} color="var(--mantine-color-blue-6)" />
                                        <Box>
                                            <Text size="xs" c="dimmed">Asignada a</Text>
                                            <Text size="sm" fw={600}>{selected.admin ?? 'Sin asignar'}</Text>
                                        </Box>
                                    </Flex>
                                </Stack>
                            </Card>
                        </Box>

                        <Box>
                            <Text fw={700} size="sm" mb="xs">Seguimiento</Text>
                            <Stack gap="xs">
                                {[
                                    ['Reportada', selected.fecha_reporte],
                                    ['Asignada', selected.fecha_asignacion],
                                    ['Resuelta', selected.fecha_resolucion],
                                ].map(([label, value]) => (
                                    <Card key={label} withBorder radius="sm" p="sm">
                                        <Flex justify="space-between" align="center">
                                            <Flex align="center" gap="xs">
                                                <IconCalendar size={16} color="var(--mantine-color-blue-6)" />
                                                <Text size="sm">{label}</Text>
                                            </Flex>
                                            <Text size="sm" fw={600}>{formatDate(value)}</Text>
                                        </Flex>
                                    </Card>
                                ))}
                                <Card withBorder radius="sm" p="sm">
                                    <Flex justify="space-between" align="center">
                                        <Text size="sm">Costo de reparación</Text>
                                        <Text size="sm" fw={700} c="blue">{formatMoney(selected.costo_reparacion)}</Text>
                                    </Flex>
                                </Card>
                            </Stack>
                        </Box>

                        {selected.comentario && (
                            <Box>
                                <Text fw={700} size="sm" mb="xs">Comentario del administrador</Text>
                                <Card withBorder radius="sm" p="sm" bg="var(--mantine-color-blue-0)">
                                    <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>{selected.comentario}</Text>
                                </Card>
                            </Box>
                        )}

                        <Group justify="flex-end" mt="md">
                            <Button
                                variant="outline"
                                color="yellow"
                                leftSection={<IconPencil size={16} />}
                                onClick={() => {
                                    closeDetail();
                                    handleOpenEdit(selected);
                                }}
                            >
                                Editar Incidencia
                            </Button>
                        </Group>
                    </Stack>
                )}
            </Drawer>
        </>
    );
}
