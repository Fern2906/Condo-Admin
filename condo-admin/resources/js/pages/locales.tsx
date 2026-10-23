import { useState, useMemo } from 'react';
import { ActionIcon, Badge, Box, Button, Card, Center, Checkbox, Drawer, Flex, Grid, Group, Menu, Modal, NumberInput, RingProgress, Select, SimpleGrid, Stack, Table, Text, TextInput, ThemeIcon, Title, } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Head, router, useForm } from '@inertiajs/react';
import { IconAlertCircle, IconBuilding, IconBuildingStore, IconCalendar, IconCheck, IconDotsVertical, IconEye, IconMail, IconPencil, IconPhone, IconPlus, IconTools, IconTrash, IconUser, } from '@tabler/icons-react';
import LocalController from '@/actions/App/Http/Controllers/LocalController';
import { TittlePage } from '@/matine-components/tittle-page';
import { FilterBox } from '@/matine-components/filter-box';
import { BulkActionBar } from '@/matine-components/BulkActionBar';

// Forma que entrega App\Http\Resources\LocalResource
export interface LocalData {
    id: number;
    code: string;
    name: string;
    businessType: string;
    building: string;
    level: string;
    area: number;
    monthlyRent: number;
    maintenanceFee: number;
    status: 'Ocupado' | 'Disponible' | 'Mantenimiento' | 'Reservado';
    tenantName: string | null;
    tenantMail: string | null;
    tenantPhone: string | null;
    contractEnd: string | null;
}

// Campos que valida App\Http\Requests\LocalRequest
type LocalForm = {
    code: string;
    name: string;
    businessType: string;
    building: string;
    level: string;
    area: number | string;
    monthlyRent: number | string;
    maintenanceFee: number | string;
    status: LocalData['status'];
    tenantName: string;
    tenantMail: string;
    tenantPhone: string;
    contractEnd: string;
};

const emptyLocal: LocalForm = {
    code: '',
    name: '',
    businessType: 'Comercial / Retail',
    building: 'Torre A',
    level: 'Planta Baja',
    area: 60,
    monthlyRent: 15000,
    maintenanceFee: 2000,
    status: 'Disponible',
    tenantName: '',
    tenantMail: '',
    tenantPhone: '',
    contractEnd: '',
};

const toForm = (local: LocalData): LocalForm => ({
    code: local.code,
    name: local.name,
    businessType: local.businessType,
    building: local.building,
    level: local.level,
    area: local.area,
    monthlyRent: local.monthlyRent,
    maintenanceFee: local.maintenanceFee,
    status: local.status,
    tenantName: local.tenantName ?? '',
    tenantMail: local.tenantMail ?? '',
    tenantPhone: local.tenantPhone ?? '',
    contractEnd: local.contractEnd ?? '',
});

const ESTADOS: LocalData['status'][] = ['Disponible', 'Ocupado', 'Mantenimiento', 'Reservado'];
const GIROS = ['Comercial / Retail', 'Gastronómico', 'Salud y Farmacia', 'Servicios y Belleza', 'Oficina / Coworking', 'Conveniencia'];
const EDIFICIOS = ['Torre A', 'Torre B', 'Torre C', 'Plaza Central'];
const NIVELES = ['Planta Baja', 'Piso 1', 'Piso 2', 'Nivel Terraza'];

// Agrega el valor actual a las opciones para que el Select lo muestre aunque no esté en la lista.
const withValue = (options: string[], value: string) =>
    value && !options.includes(value) ? [value, ...options] : options;

const getStatusBadge = (status: LocalData['status']) => {
    switch (status) {
        case 'Ocupado':
            return <Badge color="green" variant="light">Ocupado</Badge>;
        case 'Disponible':
            return <Badge color="blue" variant="light">Disponible</Badge>;
        case 'Mantenimiento':
            return <Badge color="orange" variant="light">Mantenimiento</Badge>;
        case 'Reservado':
            return <Badge color="grape" variant="light">Reservado</Badge>;
    }
};

export default function LocalesPage({ locales }: { locales: LocalData[] }) {
    const [selection, setSelection] = useState<number[]>([]);

    const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
    const [detailDrawerOpened, { open: openDetailDrawer, close: closeDetailDrawer }] = useDisclosure(false);
    const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);

    const [status, setStatus] = useState<string[]>([]);
    const [building, setBuilding] = useState<string[]>([]);
    const [search, setSearch] = useState('');

    const statusData = ESTADOS.map((estado) => ({ value: estado, label: estado }));

    const buildingData = useMemo(
        () => [...new Set(locales.map((l) => l.building))].sort().map((b) => ({ value: b, label: b })),
        [locales]
    );

    // Se guarda el id (no el objeto) para que el drawer muestre los datos recargados del servidor.
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const selectedLocal = locales.find((l) => l.id === selectedId) ?? null;

    const createForm = useForm<LocalForm>(emptyLocal);
    const editForm = useForm<LocalForm>(emptyLocal);

    const filteredLocales = useMemo(() => {
        return locales.filter((local) => {
            const matchesSearch =
                search === '' ||
                local.code.toLowerCase().includes(search.toLowerCase()) ||
                local.name.toLowerCase().includes(search.toLowerCase()) ||
                (local.tenantName && local.tenantName.toLowerCase().includes(search.toLowerCase())) ||
                local.building.toLowerCase().includes(search.toLowerCase());

            const matchesStatus = !status || status.length === 0 || status.includes(local.status);
            const matchesBuilding = !building || building.length === 0 || building.includes(local.building);

            return matchesSearch && matchesStatus && matchesBuilding;
        });
    }, [locales, search, status, building]);

    const totalLocales = locales.length;
    const occupiedCount = locales.filter((l) => l.status === 'Ocupado').length;
    const availableCount = locales.filter((l) => l.status === 'Disponible').length;
    const maintenanceCount = locales.filter((l) => l.status === 'Mantenimiento').length;
    const occupiedPercentage = totalLocales > 0 ? Math.round((occupiedCount / totalLocales) * 100) : 0;

    const toggleRow = (id: number) => {
        setSelection((current) =>
            current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
        );
    };

    const toggleAll = () => {
        setSelection((current) =>
            current.length === filteredLocales.length ? [] : filteredLocales.map((l) => l.id)
        );
    };

    const handleViewDetail = (local: LocalData) => {
        setSelectedId(local.id);
        openDetailDrawer();
    };

    const handleOpenEdit = (local: LocalData) => {
        setSelectedId(local.id);
        editForm.clearErrors();
        editForm.setData(toForm(local));
        openEditModal();
    };

    const handleMarkAsAvailable = () => {
        router.patch(
            LocalController.updateStatus(),
            { ids: selection, status: 'Disponible' },
            { preserveScroll: true, onSuccess: () => setSelection([]) }
        );
    };

    const handleSaveEdit = () => {
        if (!selectedLocal) return;
        editForm.submit(LocalController.update(selectedLocal.id), {
            preserveScroll: true,
            onSuccess: () => closeEditModal(),
        });
    };

    const handleDeleteSingle = (local: LocalData) => {
        if (!window.confirm(`¿Eliminar el local ${local.code}? Esta acción no se puede deshacer.`)) return;
        router.delete(LocalController.destroy(local.id), {
            preserveScroll: true,
            onSuccess: () => setSelection((prev) => prev.filter((id) => id !== local.id)),
        });
    };

    const handleDeleteSelected = () => {
        if (!window.confirm(`¿Eliminar ${selection.length} locales? Esta acción no se puede deshacer.`)) return;
        router.delete(LocalController.destroyMany(), {
            data: { ids: selection },
            preserveScroll: true,
            onSuccess: () => setSelection([]),
        });
    };

    const handleCreateLocal = () => {
        // Los datos del locatario solo se capturan cuando el local está ocupado.
        createForm.transform((data) =>
            data.status === 'Ocupado'
                ? data
                : { ...data, tenantName: '', tenantMail: '', tenantPhone: '', contractEnd: '' }
        );
        createForm.submit(LocalController.store(), {
            preserveScroll: true,
            onSuccess: () => {
                closeCreateModal();
                createForm.reset();
            },
        });
    };


    return (
        <>
            <Head title="Gestión de Locales" />

            <Stack gap="xl" p="md" w="100%" h="100%">
                <Flex justify="space-between" align="center" wrap="wrap" gap="md">
                    <TittlePage title='Gestión de Locales' message='Control de ocupación, contratos y especificaciones de locales comerciales' icon={<IconBuildingStore size={40} color='var(--mantine-color-blue-8)'/>} />
                    <Button leftSection={<IconPlus size={18} />} color="blue" radius="md" onClick={openCreateModal}>Nuevo Local</Button>
                </Flex>

                <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
                    <Card withBorder radius="md" padding="md">
                        <Group justify="space-between" align="center">
                            <Box>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                    Total de Locales
                                </Text>
                                <Title order={3} fw={700} mt={4}>
                                    {totalLocales}
                                </Title>
                                <Text size="xs" c="dimmed" mt={2}>
                                    Espacios comerciales
                                </Text>
                            </Box>
                            <ThemeIcon color="blue" variant="light" size="xl" radius="md">
                                <IconBuilding size={24} />
                            </ThemeIcon>
                        </Group>
                    </Card>

                    <Card withBorder radius="md" padding="md">
                        <Group justify="space-between" align="center">
                            <Box>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                    Locales Ocupados
                                </Text>
                                <Title order={3} fw={700} mt={4} c="green">
                                    {occupiedCount}
                                </Title>
                                <Text size="xs" c="dimmed" mt={2}>
                                    {occupiedPercentage}% del total
                                </Text>
                            </Box>
                            <RingProgress
                                size={52}
                                thickness={5}
                                roundCaps
                                sections={[{ value: occupiedPercentage, color: 'green' }]}
                                label={
                                    <Center>
                                        <IconCheck size={16} color="var(--mantine-color-green-6)" />
                                    </Center>
                                }
                            />
                        </Group>
                    </Card>

                    <Card withBorder radius="md" padding="md">
                        <Group justify="space-between" align="center">
                            <Box>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                    Disponibles
                                </Text>
                                <Title order={3} fw={700} mt={4} c="blue">
                                    {availableCount}
                                </Title>
                                <Text size="xs" c="dimmed" mt={2}>
                                    Listos para arrendar
                                </Text>
                            </Box>
                            <ThemeIcon color="blue" variant="light" size="xl" radius="md">
                                <IconBuildingStore size={24} />
                            </ThemeIcon>
                        </Group>
                    </Card>

                    <Card withBorder radius="md" padding="md">
                        <Group justify="space-between" align="center">
                            <Box>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                    Mantenimiento
                                </Text>
                                <Title order={3} fw={700} mt={4} c="orange">
                                    {maintenanceCount}
                                </Title>
                                <Text size="xs" c="dimmed" mt={2}>
                                    En acondicionamiento
                                </Text>
                            </Box>
                            <ThemeIcon color="orange" variant="light" size="xl" radius="md">
                                <IconTools size={24} />
                            </ThemeIcon>
                        </Group>
                    </Card>
                </SimpleGrid>

                <FilterBox searchQuery={search}
                    setSearchQuery={setSearch}
                    filterStatus={status}
                    setFilterStatus={setStatus}
                    filterBuilding={building}
                    setFilterBuilding={setBuilding}
                    statusOptions={statusData}
                    buildingOptions={buildingData} />

                <Card withBorder radius="md" padding="lg" w="100%">
                    <Table.ScrollContainer minWidth={850} maxHeight={600}>
                        <Table striped highlightOnHover verticalSpacing="sm">
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th w={40}>
                                        <Checkbox
                                            aria-label="Seleccionar todos"
                                            checked={selection.length > 0 && selection.length === filteredLocales.length}
                                            indeterminate={
                                                selection.length > 0 && selection.length !== filteredLocales.length
                                            }
                                            onChange={toggleAll}
                                        />
                                    </Table.Th>
                                    <Table.Th>Código</Table.Th>
                                    <Table.Th>Nombre / Giro</Table.Th>
                                    <Table.Th>Ubicación</Table.Th>
                                    <Table.Th>Superficie</Table.Th>
                                    <Table.Th>Locatario</Table.Th>
                                    <Table.Th>Renta Mensual</Table.Th>
                                    <Table.Th>Estado</Table.Th>
                                    <Table.Th ta="center">Acciones</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {filteredLocales.length === 0 ? (
                                    <Table.Tr>
                                        <Table.Td colSpan={9} ta="center" py="xl">
                                            <Flex direction="column" align="center" gap="xs">
                                                <IconAlertCircle size={32} color="gray" />
                                                <Text c="dimmed">No se encontraron locales con los filtros seleccionados.</Text>
                                            </Flex>
                                        </Table.Td>
                                    </Table.Tr>
                                ) : (
                                    filteredLocales.map((local) => (
                                        <Table.Tr key={local.id}>
                                            <Table.Td>
                                                <Checkbox
                                                    checked={selection.includes(local.id)}
                                                    onChange={() => toggleRow(local.id)}
                                                />
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge variant="outline" color="blue" fw={700}>
                                                    {local.code}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text fw={600} size="sm">
                                                    {local.name}
                                                </Text>
                                                <Text size="xs" c="dimmed">
                                                    {local.businessType}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm">{local.building}</Text>
                                                <Text size="xs" c="dimmed">
                                                    {local.level}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm">{local.area} m²</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                {local.tenantName ? (
                                                    <Box>
                                                        <Text size="sm" fw={500}>
                                                            {local.tenantName}
                                                        </Text>
                                                        <Text size="xs" c="dimmed">
                                                            {local.tenantMail ?? 'Sin email'}
                                                        </Text>
                                                    </Box>
                                                ) : (
                                                    <Text size="xs" c="dimmed" fs="italic">
                                                        Sin locatario asignado
                                                    </Text>
                                                )}
                                            </Table.Td>
                                            <Table.Td>
                                                <Text fw={600} size="sm">
                                                    ${local.monthlyRent.toLocaleString('es-MX')} MXN
                                                </Text>
                                                <Text size="xs" c="dimmed">
                                                    + ${local.maintenanceFee.toLocaleString('es-MX')} mant.
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Center>{getStatusBadge(local.status)}</Center>
                                            </Table.Td>
                                            <Table.Td>
                                                <Group gap="xs" justify="center">
                                                    <ActionIcon variant="subtle" color="blue" onClick={() => handleViewDetail(local)} title="Ver detalles">
                                                        <IconEye size={16} />
                                                    </ActionIcon>
                                                    <ActionIcon variant="subtle" color="yellow" onClick={() => handleOpenEdit(local)} title="Editar">
                                                        <IconPencil size={16} />
                                                    </ActionIcon>
                                                    <Menu position="bottom-end" shadow="md">
                                                        <Menu.Target>
                                                            <ActionIcon variant="subtle" color="gray">
                                                                <IconDotsVertical size={16} />
                                                            </ActionIcon>
                                                        </Menu.Target>
                                                        <Menu.Dropdown>
                                                            <Menu.Item leftSection={<IconEye size={14} />} onClick={() => handleViewDetail(local)}>
                                                                Ver detalles
                                                            </Menu.Item>
                                                            <Menu.Item leftSection={<IconPencil size={14} />} onClick={() => handleOpenEdit(local)}>
                                                                Editar local
                                                            </Menu.Item>
                                                            <Menu.Divider />
                                                            <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={() => handleDeleteSingle(local)}>
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


                <BulkActionBar
                    selection={selection}
                    onClearSelection={() => setSelection([])}
                    onDeleteSelected={handleDeleteSelected}
                    onMarkAsAvailable={handleMarkAsAvailable}
                    itemName="locales"
                />
            </Stack>

            <Modal opened={createModalOpened} onClose={closeCreateModal}
                title={
                    <Group gap="xs">
                        <ThemeIcon color="blue" variant="light" size="md">
                            <IconPlus size={16} />
                        </ThemeIcon>
                        <Text fw={600}>Registrar Nuevo Local</Text>
                    </Group>
                }
                size="lg"
                radius="md"
            >
                <Stack gap="md">
                    <Grid gap="md">
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                            <TextInput label="Código del local" placeholder="Ej: LC-11" required value={createForm.data.code} error={createForm.errors.code} onChange={(e) => createForm.setData('code', e.currentTarget.value)}/>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 8 }}>
                            <TextInput label="Nombre / Razón Social" placeholder="Ej: Cafetería Central" required value={createForm.data.name} error={createForm.errors.name}
                                onChange={(e) => createForm.setData('name', e.currentTarget.value)}
                            />
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select label="Giro o categoría comercial"
                                data={GIROS}
                                value={createForm.data.businessType}
                                error={createForm.errors.businessType}
                                onChange={(val) => createForm.setData('businessType', val || 'Comercial')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select label="Estado inicial" data={ESTADOS}
                                value={createForm.data.status}
                                error={createForm.errors.status}
                                onChange={(val) =>
                                    createForm.setData('status', (val as LocalData['status']) || 'Disponible')
                                }
                            />
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select label="Edificio / Zona" data={EDIFICIOS} value={createForm.data.building} error={createForm.errors.building}
                                onChange={(val) => createForm.setData('building', val || 'Torre A')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select label="Nivel / Piso" data={NIVELES} value={createForm.data.level} error={createForm.errors.level} onChange={(val) => createForm.setData('level', val || 'Planta Baja')}
                            />
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, sm: 4 }}>
                            <NumberInput label="Superficie (m²)" min={10} max={1000} value={createForm.data.area} error={createForm.errors.area} onChange={(val) => createForm.setData('area', val)}/>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                            <NumberInput
                                label="Renta Mensual ($)"
                                min={1000}
                                step={1000}
                                value={createForm.data.monthlyRent}
                                error={createForm.errors.monthlyRent}
                                onChange={(val) => createForm.setData('monthlyRent', val)}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                            <NumberInput
                                label="Mantenimiento ($)"
                                min={500}
                                step={500}
                                value={createForm.data.maintenanceFee}
                                error={createForm.errors.maintenanceFee}
                                onChange={(val) => createForm.setData('maintenanceFee', val)}
                            />
                        </Grid.Col>
                    </Grid>

                    {createForm.data.status === 'Ocupado' && (
                        <Card withBorder radius="sm" p="sm" bg="var(--mantine-color-gray-0)">
                            <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="xs">
                                Información del Locatario
                            </Text>
                            <Grid gap="xs">
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                    <TextInput
                                        size="xs"
                                        label="Nombre del locatario"
                                        placeholder="Nombre completo"
                                        value={createForm.data.tenantName}
                                        error={createForm.errors.tenantName}
                                        onChange={(e) => createForm.setData('tenantName', e.currentTarget.value)}
                                    />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                    <TextInput
                                        size="xs"
                                        label="Correo electrónico"
                                        placeholder="correo@ejemplo.com"
                                        value={createForm.data.tenantMail}
                                        error={createForm.errors.tenantMail}
                                        onChange={(e) => createForm.setData('tenantMail', e.currentTarget.value)}
                                    />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                    <TextInput
                                        size="xs"
                                        label="Teléfono"
                                        placeholder="+52 ..."
                                        value={createForm.data.tenantPhone}
                                        error={createForm.errors.tenantPhone}
                                        onChange={(e) => createForm.setData('tenantPhone', e.currentTarget.value)}
                                    />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                    <TextInput
                                        size="xs"
                                        type="date"
                                        label="Fin de contrato"
                                        value={createForm.data.contractEnd}
                                        error={createForm.errors.contractEnd}
                                        onChange={(e) => createForm.setData('contractEnd', e.currentTarget.value)}
                                    />
                                </Grid.Col>
                            </Grid>
                            <Text size="xs" c="dimmed" mt="xs">
                                Si el correo no existe se crea la cuenta del locatario; podrá definir su contraseña con "¿Olvidaste tu contraseña?".
                            </Text>
                        </Card>
                    )}

                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={closeCreateModal}>
                            Cancelar
                        </Button>
                        <Button color="blue" onClick={handleCreateLocal} loading={createForm.processing}>
                            Guardar Local
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Modal: Editar Local */}
            <Modal
                opened={editModalOpened}
                onClose={closeEditModal}
                title={
                    <Group gap="xs">
                        <ThemeIcon color="yellow" variant="light" size="md">
                            <IconPencil size={16} />
                        </ThemeIcon>
                        <Text fw={600}>Editar Local {selectedLocal?.code}</Text>
                    </Group>
                }
                size="lg"
                radius="md"
            >
                <Stack gap="md">
                    <Grid gap="md">
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                            <TextInput
                                label="Código del local"
                                value={editForm.data.code}
                                error={editForm.errors.code}
                                onChange={(e) => editForm.setData('code', e.currentTarget.value)}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 8 }}>
                            <TextInput
                                label="Nombre / Razón Social"
                                value={editForm.data.name}
                                error={editForm.errors.name}
                                onChange={(e) => editForm.setData('name', e.currentTarget.value)}
                            />
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select
                                label="Giro comercial"
                                data={withValue(GIROS, editForm.data.businessType)}
                                value={editForm.data.businessType}
                                error={editForm.errors.businessType}
                                onChange={(val) => editForm.setData('businessType', val || '')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select
                                label="Estado del local"
                                data={ESTADOS}
                                value={editForm.data.status}
                                error={editForm.errors.status}
                                onChange={(val) =>
                                    editForm.setData('status', (val as LocalData['status']) || 'Disponible')
                                }
                            />
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select
                                label="Edificio / Zona"
                                data={withValue(EDIFICIOS, editForm.data.building)}
                                value={editForm.data.building}
                                error={editForm.errors.building}
                                onChange={(val) => editForm.setData('building', val || 'Torre A')}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select
                                label="Nivel / Piso"
                                data={withValue(NIVELES, editForm.data.level)}
                                value={editForm.data.level}
                                error={editForm.errors.level}
                                onChange={(val) => editForm.setData('level', val || 'Planta Baja')}
                            />
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, sm: 4 }}>
                            <NumberInput
                                label="Superficie (m²)"
                                value={editForm.data.area}
                                error={editForm.errors.area}
                                onChange={(val) => editForm.setData('area', val)}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                            <NumberInput
                                label="Renta Mensual ($)"
                                value={editForm.data.monthlyRent}
                                error={editForm.errors.monthlyRent}
                                onChange={(val) => editForm.setData('monthlyRent', val)}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                            <NumberInput
                                label="Mantenimiento ($)"
                                value={editForm.data.maintenanceFee}
                                error={editForm.errors.maintenanceFee}
                                onChange={(val) => editForm.setData('maintenanceFee', val)}
                            />
                        </Grid.Col>
                    </Grid>

                    <Card withBorder radius="sm" p="sm" bg="var(--mantine-color-gray-0)">
                        <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="xs">
                            Datos del Locatario
                        </Text>
                        <Grid gap="xs">
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <TextInput
                                    size="xs"
                                    label="Nombre"
                                    placeholder="Sin locatario"
                                    value={editForm.data.tenantName}
                                    error={editForm.errors.tenantName}
                                    onChange={(e) => editForm.setData('tenantName', e.currentTarget.value)}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <TextInput
                                    size="xs"
                                    label="Email"
                                    placeholder="correo@ejemplo.com"
                                    value={editForm.data.tenantMail}
                                    error={editForm.errors.tenantMail}
                                    onChange={(e) => editForm.setData('tenantMail', e.currentTarget.value)}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <TextInput
                                    size="xs"
                                    label="Teléfono"
                                    placeholder="+52 ..."
                                    value={editForm.data.tenantPhone}
                                    error={editForm.errors.tenantPhone}
                                    onChange={(e) => editForm.setData('tenantPhone', e.currentTarget.value)}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <TextInput
                                    size="xs"
                                    type="date"
                                    label="Fin de contrato"
                                    value={editForm.data.contractEnd}
                                    error={editForm.errors.contractEnd}
                                    onChange={(e) => editForm.setData('contractEnd', e.currentTarget.value)}
                                />
                            </Grid.Col>
                        </Grid>
                        <Text size="xs" c="dimmed" mt="xs">
                            Deja el nombre y el correo vacíos para quitar al locatario del local.
                        </Text>
                    </Card>

                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={closeEditModal}>
                            Cancelar
                        </Button>
                        <Button color="yellow" onClick={handleSaveEdit} loading={editForm.processing}>
                            Actualizar Local
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Drawer: Detalles del Local */}
            <Drawer
                opened={detailDrawerOpened}
                onClose={closeDetailDrawer}
                title={
                    selectedLocal ? (
                        <Group gap="xs">
                            <Badge size="lg" color="blue" variant="filled">
                                {selectedLocal.code}
                            </Badge>
                            <Text fw={700} size="md">
                                {selectedLocal.name}
                            </Text>
                        </Group>
                    ) : null
                }
                position="right"
                size="md"
                overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
            >
                {selectedLocal && (
                    <Stack gap="lg" mt="md">
                        <Card withBorder radius="md" p="md">
                            <Group justify="space-between" mb="xs">
                                <Text size="xs" tt="uppercase" fw={700} c="dimmed">
                                    Estado Actual
                                </Text>
                                {getStatusBadge(selectedLocal.status)}
                            </Group>
                            <Text size="sm" c="dimmed">
                                Giro comercial: <Text span fw={600} c="dark">{selectedLocal.businessType}</Text>
                            </Text>
                        </Card>

                        <Box>
                            <Text fw={700} size="sm" mb="xs">
                                Ubicación y Dimensiones
                            </Text>
                            <SimpleGrid cols={2} spacing="xs">
                                <Card withBorder radius="sm" p="xs">
                                    <Text size="xs" c="dimmed">Edificio</Text>
                                    <Text fw={600} size="sm">{selectedLocal.building}</Text>
                                </Card>
                                <Card withBorder radius="sm" p="xs">
                                    <Text size="xs" c="dimmed">Nivel / Piso</Text>
                                    <Text fw={600} size="sm">{selectedLocal.level}</Text>
                                </Card>
                                <Card withBorder radius="sm" p="xs">
                                    <Text size="xs" c="dimmed">Superficie Total</Text>
                                    <Text fw={600} size="sm">{selectedLocal.area} m²</Text>
                                </Card>
                                <Card withBorder radius="sm" p="xs">
                                    <Text size="xs" c="dimmed">Identificador</Text>
                                    <Text fw={600} size="sm">{selectedLocal.code}</Text>
                                </Card>
                            </SimpleGrid>
                        </Box>

                        <Box>
                            <Text fw={700} size="sm" mb="xs">
                                Aspectos Financieros
                            </Text>
                            <Stack gap="xs">
                                <Card withBorder radius="sm" p="sm">
                                    <Flex justify="space-between" align="center">
                                        <Text size="sm">Renta Mensual:</Text>
                                        <Text fw={700} size="md" c="blue">
                                            ${selectedLocal.monthlyRent.toLocaleString('es-MX')} MXN
                                        </Text>
                                    </Flex>
                                </Card>
                                <Card withBorder radius="sm" p="sm">
                                    <Flex justify="space-between" align="center">
                                        <Text size="sm">Cuota Mantenimiento:</Text>
                                        <Text fw={700} size="sm">
                                            ${selectedLocal.maintenanceFee.toLocaleString('es-MX')} MXN
                                        </Text>
                                    </Flex>
                                </Card>
                            </Stack>
                        </Box>

                        <Box>
                            <Text fw={700} size="sm" mb="xs">
                                Información de Ocupación
                            </Text>
                            {selectedLocal.tenantName ? (
                                <Card withBorder radius="md" p="md">
                                    <Stack gap="xs">
                                        <Flex align="center" gap="xs">
                                            <IconUser size={18} color="var(--mantine-color-blue-6)" />
                                            <Box>
                                                <Text size="xs" c="dimmed">Locatario actual</Text>
                                                <Text size="sm" fw={600}>{selectedLocal.tenantName}</Text>
                                            </Box>
                                        </Flex>
                                        <Flex align="center" gap="xs">
                                            <IconMail size={18} color="var(--mantine-color-blue-6)" />
                                            <Box>
                                                <Text size="xs" c="dimmed">Correo electrónico</Text>
                                                <Text size="sm">{selectedLocal.tenantMail}</Text>
                                            </Box>
                                        </Flex>
                                        <Flex align="center" gap="xs">
                                            <IconPhone size={18} color="var(--mantine-color-blue-6)" />
                                            <Box>
                                                <Text size="xs" c="dimmed">Teléfono de contacto</Text>
                                                <Text size="sm">{selectedLocal.tenantPhone ?? 'Sin teléfono'}</Text>
                                            </Box>
                                        </Flex>
                                        {selectedLocal.contractEnd && (
                                            <Flex align="center" gap="xs">
                                                <IconCalendar size={18} color="var(--mantine-color-blue-6)" />
                                                <Box>
                                                    <Text size="xs" c="dimmed">Fin de Contrato</Text>
                                                    <Text size="sm" fw={600}>{selectedLocal.contractEnd}</Text>
                                                </Box>
                                            </Flex>
                                        )}
                                    </Stack>
                                </Card>
                            ) : (
                                <Card withBorder radius="md" p="md" bg="var(--mantine-color-blue-0)">
                                    <Center py="sm">
                                        <Stack align="center" gap="xs">
                                            <IconBuildingStore size={32} color="var(--mantine-color-blue-6)" />
                                            <Text fw={600} size="sm" c="blue">
                                                Este local no tiene locatario asignado
                                            </Text>
                                            <Text size="xs" c="dimmed" ta="center">
                                                Está listo para ser ofertado en arrendamiento o asignado a un nuevo inquilino.
                                            </Text>
                                        </Stack>
                                    </Center>
                                </Card>
                            )}
                        </Box>

                        <Group justify="flex-end" mt="md">
                            <Button
                                variant="outline"
                                color="yellow"
                                leftSection={<IconPencil size={16} />}
                                onClick={() => {
                                    closeDetailDrawer();
                                    handleOpenEdit(selectedLocal);
                                }}
                            >
                                Editar Local
                            </Button>
                        </Group>
                    </Stack>
                )}
            </Drawer>
        </>
    );
}
