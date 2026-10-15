import { useState, useMemo } from 'react';
import { ActionBar, ActionIcon, Badge, Box, Button, Card, Center, Checkbox, Drawer, Flex, Grid, Group, Menu, Modal, NumberInput, RingProgress, SegmentedControl, Select, SimpleGrid, Stack, Table, Text, TextInput, ThemeIcon, Title, } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Head } from '@inertiajs/react';
import { IconAlertCircle, IconBuilding, IconBuildingStore, IconCalendar, IconCheck, IconDotsVertical, IconEye, IconLayoutGrid, IconList, IconMail, IconMaximize, IconPencil, IconPhone, IconPlus, IconReceipt, IconSearch, IconTools, IconTrash, IconUser, IconX, } from '@tabler/icons-react';

export interface LocalData {
    id: string;
    code: string;
    name: string;
    businessType: string;
    building: string;
    level: string;
    area: number; // m2
    monthlyRent: number;
    maintenanceFee: number;
    status: 'Ocupado' | 'Disponible' | 'Mantenimiento' | 'Reservado';
    tenantName?: string;
    tenantMail?: string;
    tenantPhone?: string;
    contractEnd?: string;
}

const initialLocales: LocalData[] = [
    {
        id: '1',
        code: 'LC-01',
        name: 'Café & Bistro Gourmet',
        businessType: 'Gastronómico',
        building: 'Torre A',
        level: 'Planta Baja',
        area: 120,
        monthlyRent: 28000,
        maintenanceFee: 3500,
        status: 'Ocupado',
        tenantName: 'Carlos Mendoza',
        tenantMail: 'carlos.mendoza@email.com',
        tenantPhone: '+52 55 1234 5678',
        contractEnd: '2027-08-31',
    },
    {
        id: '2',
        code: 'LC-02',
        name: 'Boutique Alta Moda',
        businessType: 'Comercial / Moda',
        building: 'Torre A',
        level: 'Planta Baja',
        area: 85,
        monthlyRent: 21000,
        maintenanceFee: 2600,
        status: 'Ocupado',
        tenantName: 'Ana Sofía Rivas',
        tenantMail: 'ana.rivas@email.com',
        tenantPhone: '+52 55 8765 4321',
        contractEnd: '2026-12-15',
    },
    {
        id: '3',
        code: 'LC-03',
        name: 'Espacio Comercial 03',
        businessType: 'Comercial / Retail',
        building: 'Torre B',
        level: 'Planta Baja',
        area: 65,
        monthlyRent: 17500,
        maintenanceFee: 2200,
        status: 'Disponible',
    },
    {
        id: '4',
        code: 'LC-04',
        name: 'Mini Market Express',
        businessType: 'Conveniencia',
        building: 'Torre C',
        level: 'Planta Baja',
        area: 95,
        monthlyRent: 23000,
        maintenanceFee: 2900,
        status: 'Ocupado',
        tenantName: 'Miguel Ángel Ruiz',
        tenantMail: 'miguel.ruiz@email.com',
        tenantPhone: '+52 55 9876 1234',
        contractEnd: '2027-02-28',
    },
    {
        id: '5',
        code: 'LC-05',
        name: 'Farmacia & Dermocosmética',
        businessType: 'Salud y Farmacia',
        building: 'Torre B',
        level: 'Planta Baja',
        area: 110,
        monthlyRent: 26000,
        maintenanceFee: 3200,
        status: 'Ocupado',
        tenantName: 'Elena Gómez',
        tenantMail: 'elena.gomez@email.com',
        tenantPhone: '+52 55 4321 8765',
        contractEnd: '2026-11-30',
    },
    {
        id: '6',
        code: 'LC-06',
        name: 'Local en Renovación',
        businessType: 'Comercial',
        building: 'Plaza Central',
        level: 'Piso 1',
        area: 75,
        monthlyRent: 19000,
        maintenanceFee: 2400,
        status: 'Mantenimiento',
    },
    {
        id: '7',
        code: 'LC-07',
        name: 'Estudio de Belleza y Spa',
        businessType: 'Servicios',
        building: 'Plaza Central',
        level: 'Piso 1',
        area: 90,
        monthlyRent: 22500,
        maintenanceFee: 2800,
        status: 'Ocupado',
        tenantName: 'Mariana Fuentes',
        tenantMail: 'mariana.fuentes@email.com',
        tenantPhone: '+52 55 3344 5566',
        contractEnd: '2027-05-15',
    },
    {
        id: '8',
        code: 'LC-08',
        name: 'Isla Comercial Central',
        businessType: 'Kiosco / Accesorios',
        building: 'Plaza Central',
        level: 'Planta Baja',
        area: 30,
        monthlyRent: 12000,
        maintenanceFee: 1500,
        status: 'Disponible',
    },
    {
        id: '9',
        code: 'LC-09',
        name: 'Consultorio Dental Especializado',
        businessType: 'Salud y Servicios',
        building: 'Torre C',
        level: 'Piso 1',
        area: 70,
        monthlyRent: 18500,
        maintenanceFee: 2300,
        status: 'Reservado',
        tenantName: 'Dr. Roberto Saldaña',
        tenantMail: 'roberto.saldana@email.com',
        tenantPhone: '+52 55 6677 8899',
        contractEnd: '2026-09-30',
    },
    {
        id: '10',
        code: 'LC-10',
        name: 'Local Panorámico Terraza',
        businessType: 'Gastronómico / Bar',
        building: 'Torre A',
        level: 'Piso 2',
        area: 140,
        monthlyRent: 35000,
        maintenanceFee: 4500,
        status: 'Disponible',
    },
];

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

export default function LocalesPage() {
    const [localesList, setLocalesList] = useState<LocalData[]>(initialLocales);
    const [selection, setSelection] = useState<string[]>([]);
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<string | null>(null);
    const [filterBuilding, setFilterBuilding] = useState<string | null>(null);

    // Modal / Drawer state
    const [createModalOpened, { open: openCreateModal, close: closeCreateModal }] = useDisclosure(false);
    const [detailDrawerOpened, { open: openDetailDrawer, close: closeDetailDrawer }] = useDisclosure(false);
    const [editModalOpened, { open: openEditModal, close: closeEditModal }] = useDisclosure(false);
    const [selectedLocal, setSelectedLocal] = useState<LocalData | null>(null);

    // New Local form state
    const [newLocal, setNewLocal] = useState<Partial<LocalData>>({
        code: '',
        name: '',
        businessType: 'Comercial / Retail',
        building: 'Torre A',
        level: 'Planta Baja',
        area: 60,
        monthlyRent: 15000,
        maintenanceFee: 2000,
        status: 'Disponible',
    });

    // Edit Local form state
    const [editFormData, setEditFormData] = useState<Partial<LocalData>>({});

    // Filtered locales
    const filteredLocales = useMemo(() => {
        return localesList.filter((local) => {
            const matchesSearch =
                searchQuery === '' ||
                local.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                local.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (local.tenantName && local.tenantName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                local.building.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = !filterStatus || filterStatus === 'todos' || local.status === filterStatus;
            const matchesBuilding = !filterBuilding || filterBuilding === 'todos' || local.building === filterBuilding;

            return matchesSearch && matchesStatus && matchesBuilding;
        });
    }, [localesList, searchQuery, filterStatus, filterBuilding]);

    // Summary calculations
    const totalLocales = localesList.length;
    const occupiedCount = localesList.filter((l) => l.status === 'Ocupado').length;
    const availableCount = localesList.filter((l) => l.status === 'Disponible').length;
    const maintenanceCount = localesList.filter((l) => l.status === 'Mantenimiento').length;
    const occupiedPercentage = totalLocales > 0 ? Math.round((occupiedCount / totalLocales) * 100) : 0;

    // Checkbox selection handlers
    const toggleRow = (code: string) => {
        setSelection((current) =>
            current.includes(code) ? current.filter((item) => item !== code) : [...current, code]
        );
    };

    const toggleAll = () => {
        setSelection((current) =>
            current.length === filteredLocales.length ? [] : filteredLocales.map((l) => l.code)
        );
    };

    // Open detail
    const handleViewDetail = (local: LocalData) => {
        setSelectedLocal(local);
        openDetailDrawer();
    };

    // Open edit
    const handleOpenEdit = (local: LocalData) => {
        setSelectedLocal(local);
        setEditFormData({ ...local });
        openEditModal();
    };

    // Save edited local
    const handleSaveEdit = () => {
        if (!selectedLocal) return;
        setLocalesList((prev) =>
            prev.map((item) => (item.id === selectedLocal.id ? ({ ...item, ...editFormData } as LocalData) : item))
        );
        closeEditModal();
    };

    // Handle delete single
    const handleDeleteSingle = (id: string) => {
        setLocalesList((prev) => prev.filter((item) => item.id !== id));
        setSelection((prev) => prev.filter((code) => code !== selectedLocal?.code));
    };

    // Handle delete batch
    const handleDeleteSelected = () => {
        setLocalesList((prev) => prev.filter((item) => !selection.includes(item.code)));
        setSelection([]);
    };

    // Handle create new local
    const handleCreateLocal = () => {
        if (!newLocal.code || !newLocal.name) return;
        const created: LocalData = {
            id: String(Date.now()),
            code: newLocal.code,
            name: newLocal.name,
            businessType: newLocal.businessType || 'Comercial',
            building: newLocal.building || 'Torre A',
            level: newLocal.level || 'Planta Baja',
            area: Number(newLocal.area) || 50,
            monthlyRent: Number(newLocal.monthlyRent) || 15000,
            maintenanceFee: Number(newLocal.maintenanceFee) || 2000,
            status: (newLocal.status as LocalData['status']) || 'Disponible',
            tenantName: newLocal.tenantName || undefined,
            tenantMail: newLocal.tenantMail || undefined,
            tenantPhone: newLocal.tenantPhone || undefined,
        };
        setLocalesList((prev) => [created, ...prev]);
        closeCreateModal();
        setNewLocal({
            code: '',
            name: '',
            businessType: 'Comercial / Retail',
            building: 'Torre A',
            level: 'Planta Baja',
            area: 60,
            monthlyRent: 15000,
            maintenanceFee: 2000,
            status: 'Disponible',
        });
    };

    return (
        <>
            <Head title="Gestión de Locales" />

            <Stack gap="xl" p="md" w="100%" h="100%">
                {/* Header Section */}
                <Flex justify="space-between" align="center" wrap="wrap" gap="md">
                    <Flex gap="md" align="center">
                        <Center>
                            <ThemeIcon size={52} radius="md" color="blue" variant="light">
                                <IconBuildingStore size={32} />
                            </ThemeIcon>
                        </Center>
                        <Box>
                            <Title order={2} fw={600}>
                                Gestión de Locales
                            </Title>
                            <Text c="dimmed" size="sm" mt={2}>
                                Control de ocupación, contratos y especificaciones de locales comerciales
                            </Text>
                        </Box>
                    </Flex>

                    <Button
                        leftSection={<IconPlus size={18} />}
                        color="blue"
                        radius="md"
                        onClick={openCreateModal}
                    >
                        Nuevo Local
                    </Button>
                </Flex>

                {/* Metrics / KPI Summary */}
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

                {/* Filters and View Controls Card */}
                <Card withBorder radius="md" padding="md">
                    <Grid align="center" gap="md">
                        <Grid.Col span={{ base: 12, md: 5 }}>
                            <TextInput
                                placeholder="Buscar por código, nombre, edificio o locatario..."
                                leftSection={<IconSearch size={16} />}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.currentTarget.value)}
                                rightSection={
                                    searchQuery ? (
                                        <ActionIcon size="xs" variant="subtle" onClick={() => setSearchQuery('')}>
                                            <IconX size={12} />
                                        </ActionIcon>
                                    ) : null
                                }
                            />
                        </Grid.Col>

                        <Grid.Col span={{ base: 6, sm: 3, md: 2.5 }}>
                            <Select
                                placeholder="Estado"
                                clearable
                                value={filterStatus}
                                onChange={setFilterStatus}
                                data={[
                                    { value: 'todos', label: 'Todos los estados' },
                                    { value: 'Ocupado', label: 'Ocupado' },
                                    { value: 'Disponible', label: 'Disponible' },
                                    { value: 'Mantenimiento', label: 'Mantenimiento' },
                                    { value: 'Reservado', label: 'Reservado' },
                                ]}
                            />
                        </Grid.Col>

                        <Grid.Col span={{ base: 6, sm: 3, md: 2.5 }}>
                            <Select
                                placeholder="Edificio"
                                clearable
                                value={filterBuilding}
                                onChange={setFilterBuilding}
                                data={[
                                    { value: 'todos', label: 'Todos los edificios' },
                                    { value: 'Torre A', label: 'Torre A' },
                                    { value: 'Torre B', label: 'Torre B' },
                                    { value: 'Torre C', label: 'Torre C' },
                                    { value: 'Plaza Central', label: 'Plaza Central' },
                                ]}
                            />
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
                            <Flex justify={{ base: 'flex-start', sm: 'flex-end' }}>
                                <SegmentedControl
                                    value={viewMode}
                                    onChange={(value) => setViewMode(value as 'table' | 'grid')}
                                    data={[
                                        {
                                            value: 'table',
                                            label: (
                                                <Center style={{ gap: 6 }}>
                                                    <IconList size={16} />
                                                    <Text size="xs">Tabla</Text>
                                                </Center>
                                            ),
                                        },
                                        {
                                            value: 'grid',
                                            label: (
                                                <Center style={{ gap: 6 }}>
                                                    <IconLayoutGrid size={16} />
                                                    <Text size="xs">Tarjetas</Text>
                                                </Center>
                                            ),
                                        },
                                    ]}
                                />
                            </Flex>
                        </Grid.Col>
                    </Grid>
                </Card>

                {/* Content: Table or Grid */}
                {viewMode === 'table' ? (
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
                                            <Table.Tr key={local.code}>
                                                <Table.Td>
                                                    <Checkbox
                                                        checked={selection.includes(local.code)}
                                                        onChange={() => toggleRow(local.code)}
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
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="blue"
                                                            onClick={() => handleViewDetail(local)}
                                                            title="Ver detalles"
                                                        >
                                                            <IconEye size={16} />
                                                        </ActionIcon>
                                                        <ActionIcon
                                                            variant="subtle"
                                                            color="yellow"
                                                            onClick={() => handleOpenEdit(local)}
                                                            title="Editar"
                                                        >
                                                            <IconPencil size={16} />
                                                        </ActionIcon>
                                                        <Menu position="bottom-end" shadow="md">
                                                            <Menu.Target>
                                                                <ActionIcon variant="subtle" color="gray">
                                                                    <IconDotsVertical size={16} />
                                                                </ActionIcon>
                                                            </Menu.Target>
                                                            <Menu.Dropdown>
                                                                <Menu.Item
                                                                    leftSection={<IconEye size={14} />}
                                                                    onClick={() => handleViewDetail(local)}
                                                                >
                                                                    Ver detalles
                                                                </Menu.Item>
                                                                <Menu.Item
                                                                    leftSection={<IconPencil size={14} />}
                                                                    onClick={() => handleOpenEdit(local)}
                                                                >
                                                                    Editar local
                                                                </Menu.Item>
                                                                <Menu.Divider />
                                                                <Menu.Item
                                                                    color="red"
                                                                    leftSection={<IconTrash size={14} />}
                                                                    onClick={() => handleDeleteSingle(local.id)}
                                                                >
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
                ) : (
                    /* Grid / Cards View */
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                        {filteredLocales.length === 0 ? (
                            <Card withBorder radius="md" p="xl" style={{ gridColumn: '1 / -1' }} ta="center">
                                <Flex direction="column" align="center" gap="xs">
                                    <IconAlertCircle size={36} color="gray" />
                                    <Text c="dimmed">No hay locales que coincidan con los criterios de búsqueda.</Text>
                                </Flex>
                            </Card>
                        ) : (
                            filteredLocales.map((local) => (
                                <Card
                                    key={local.code}
                                    withBorder
                                    radius="md"
                                    padding="lg"
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                    }}
                                >
                                    <Box>
                                        <Group justify="space-between" mb="xs">
                                            <Badge variant="outline" color="blue" size="lg" fw={700}>
                                                {local.code}
                                            </Badge>
                                            <Group gap="xs">
                                                {getStatusBadge(local.status)}
                                                <Menu position="bottom-end">
                                                    <Menu.Target>
                                                        <ActionIcon variant="subtle" color="gray" size="sm">
                                                            <IconDotsVertical size={16} />
                                                        </ActionIcon>
                                                    </Menu.Target>
                                                    <Menu.Dropdown>
                                                        <Menu.Item
                                                            leftSection={<IconEye size={14} />}
                                                            onClick={() => handleViewDetail(local)}
                                                        >
                                                            Ver detalles
                                                        </Menu.Item>
                                                        <Menu.Item
                                                            leftSection={<IconPencil size={14} />}
                                                            onClick={() => handleOpenEdit(local)}
                                                        >
                                                            Editar
                                                        </Menu.Item>
                                                        <Menu.Divider />
                                                        <Menu.Item
                                                            color="red"
                                                            leftSection={<IconTrash size={14} />}
                                                            onClick={() => handleDeleteSingle(local.id)}
                                                        >
                                                            Eliminar
                                                        </Menu.Item>
                                                    </Menu.Dropdown>
                                                </Menu>
                                            </Group>
                                        </Group>

                                        <Title order={4} fw={600} lineClamp={1}>
                                            {local.name}
                                        </Title>
                                        <Text size="xs" c="dimmed" mb="md">
                                            {local.businessType}
                                        </Text>

                                        <SimpleGrid cols={2} spacing="xs" mb="md">
                                            <Flex align="center" gap={6}>
                                                <IconBuilding size={16} color="gray" />
                                                <Box>
                                                    <Text size="xs" c="dimmed">Edificio</Text>
                                                    <Text size="xs" fw={600}>{local.building}</Text>
                                                </Box>
                                            </Flex>

                                            <Flex align="center" gap={6}>
                                                <IconMaximize size={16} color="gray" />
                                                <Box>
                                                    <Text size="xs" c="dimmed">Superficie</Text>
                                                    <Text size="xs" fw={600}>{local.area} m²</Text>
                                                </Box>
                                            </Flex>

                                            <Flex align="center" gap={6}>
                                                <IconReceipt size={16} color="gray" />
                                                <Box>
                                                    <Text size="xs" c="dimmed">Renta Mensual</Text>
                                                    <Text size="xs" fw={600}>${local.monthlyRent.toLocaleString('es-MX')}</Text>
                                                </Box>
                                            </Flex>

                                            <Flex align="center" gap={6}>
                                                <IconBuildingStore size={16} color="gray" />
                                                <Box>
                                                    <Text size="xs" c="dimmed">Nivel</Text>
                                                    <Text size="xs" fw={600}>{local.level}</Text>
                                                </Box>
                                            </Flex>
                                        </SimpleGrid>

                                        {local.tenantName ? (
                                            <Card withBorder radius="sm" p="xs" bg="var(--mantine-color-gray-0)" mb="md">
                                                <Flex align="center" gap="xs">
                                                    <ThemeIcon size="sm" radius="xl" color="blue" variant="light">
                                                        <IconUser size={12} />
                                                    </ThemeIcon>
                                                    <Box style={{ overflow: 'hidden' }}>
                                                        <Text size="xs" fw={600} lineClamp={1}>
                                                            {local.tenantName}
                                                        </Text>
                                                        <Text size="xs" c="dimmed" lineClamp={1}>
                                                            {local.tenantMail}
                                                        </Text>
                                                    </Box>
                                                </Flex>
                                            </Card>
                                        ) : (
                                            <Card withBorder radius="sm" p="xs" bg="var(--mantine-color-blue-0)" mb="md">
                                                <Text size="xs" c="blue" ta="center" fw={500}>
                                                    Disponible para arrendamiento
                                                </Text>
                                            </Card>
                                        )}
                                    </Box>

                                    <Group gap="xs" mt="sm">
                                        <Button
                                            variant="light"
                                            color="blue"
                                            fullWidth
                                            size="xs"
                                            leftSection={<IconEye size={14} />}
                                            onClick={() => handleViewDetail(local)}
                                        >
                                            Detalles
                                        </Button>
                                        <Button
                                            variant="outline"
                                            color="gray"
                                            size="xs"
                                            leftSection={<IconPencil size={14} />}
                                            onClick={() => handleOpenEdit(local)}
                                        >
                                            Editar
                                        </Button>
                                    </Group>
                                </Card>
                            ))
                        )}
                    </SimpleGrid>
                )}

                {/* Floating Action Bar on Selection */}
                <ActionBar opened={selection.length > 0} onClose={() => setSelection([])} shadow="md">
                    <Text visibleFrom="xs" size="sm">
                        {selection.length} locales seleccionados
                    </Text>
                    <ActionBar.Divider />

                    <Button
                        variant="filled"
                        color="red"
                        px={{ base: 'xs', sm: 'md' }}
                        onClick={handleDeleteSelected}
                    >
                        <IconTrash size={14} />
                        <Box visibleFrom="xs" ml={6}>
                            Eliminar
                        </Box>
                    </Button>

                    <Button
                        variant="filled"
                        color="blue"
                        px={{ base: 'xs', sm: 'md' }}
                        onClick={() => {
                            // Cambiar a disponible
                            setLocalesList((prev) =>
                                prev.map((l) => (selection.includes(l.code) ? { ...l, status: 'Disponible' } : l))
                            );
                            setSelection([]);
                        }}
                    >
                        <IconCheck size={14} />
                        <Box visibleFrom="xs" ml={6}>
                            Marcar Disponible
                        </Box>
                    </Button>

                    <ActionBar.CloseButton />
                </ActionBar>
            </Stack>

            {/* Modal: Crear Nuevo Local */}
            <Modal
                opened={createModalOpened}
                onClose={closeCreateModal}
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
                            <TextInput
                                label="Código del local"
                                placeholder="Ej: LC-11"
                                required
                                value={newLocal.code}
                                onChange={(e) => setNewLocal({ ...newLocal, code: e.currentTarget.value })}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 8 }}>
                            <TextInput
                                label="Nombre / Razón Social"
                                placeholder="Ej: Cafetería Central"
                                required
                                value={newLocal.name}
                                onChange={(e) => setNewLocal({ ...newLocal, name: e.currentTarget.value })}
                            />
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select
                                label="Giro o categoría comercial"
                                data={[
                                    'Comercial / Retail',
                                    'Gastronómico',
                                    'Salud y Farmacia',
                                    'Servicios y Belleza',
                                    'Oficina / Coworking',
                                    'Conveniencia',
                                ]}
                                value={newLocal.businessType}
                                onChange={(val) => setNewLocal({ ...newLocal, businessType: val || 'Comercial' })}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select
                                label="Estado inicial"
                                data={['Disponible', 'Ocupado', 'Mantenimiento', 'Reservado']}
                                value={newLocal.status}
                                onChange={(val) =>
                                    setNewLocal({ ...newLocal, status: (val as LocalData['status']) || 'Disponible' })
                                }
                            />
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select
                                label="Edificio / Zona"
                                data={['Torre A', 'Torre B', 'Torre C', 'Plaza Central']}
                                value={newLocal.building}
                                onChange={(val) => setNewLocal({ ...newLocal, building: val || 'Torre A' })}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select
                                label="Nivel / Piso"
                                data={['Planta Baja', 'Piso 1', 'Piso 2', 'Nivel Terraza']}
                                value={newLocal.level}
                                onChange={(val) => setNewLocal({ ...newLocal, level: val || 'Planta Baja' })}
                            />
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, sm: 4 }}>
                            <NumberInput
                                label="Superficie (m²)"
                                min={10}
                                max={1000}
                                value={newLocal.area}
                                onChange={(val) => setNewLocal({ ...newLocal, area: Number(val) })}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                            <NumberInput
                                label="Renta Mensual ($)"
                                min={1000}
                                step={1000}
                                value={newLocal.monthlyRent}
                                onChange={(val) => setNewLocal({ ...newLocal, monthlyRent: Number(val) })}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                            <NumberInput
                                label="Mantenimiento ($)"
                                min={500}
                                step={500}
                                value={newLocal.maintenanceFee}
                                onChange={(val) => setNewLocal({ ...newLocal, maintenanceFee: Number(val) })}
                            />
                        </Grid.Col>
                    </Grid>

                    {newLocal.status === 'Ocupado' && (
                        <Card withBorder radius="sm" p="sm" bg="var(--mantine-color-gray-0)">
                            <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="xs">
                                Información del Locatario
                            </Text>
                            <Grid gap="xs">
                                <Grid.Col span={{ base: 12, sm: 4 }}>
                                    <TextInput
                                        size="xs"
                                        label="Nombre del locatario"
                                        placeholder="Nombre completo"
                                        value={newLocal.tenantName || ''}
                                        onChange={(e) => setNewLocal({ ...newLocal, tenantName: e.currentTarget.value })}
                                    />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 4 }}>
                                    <TextInput
                                        size="xs"
                                        label="Correo electrónico"
                                        placeholder="correo@ejemplo.com"
                                        value={newLocal.tenantMail || ''}
                                        onChange={(e) => setNewLocal({ ...newLocal, tenantMail: e.currentTarget.value })}
                                    />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 4 }}>
                                    <TextInput
                                        size="xs"
                                        label="Teléfono"
                                        placeholder="+52 ..."
                                        value={newLocal.tenantPhone || ''}
                                        onChange={(e) => setNewLocal({ ...newLocal, tenantPhone: e.currentTarget.value })}
                                    />
                                </Grid.Col>
                            </Grid>
                        </Card>
                    )}

                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={closeCreateModal}>
                            Cancelar
                        </Button>
                        <Button color="blue" onClick={handleCreateLocal}>
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
                                value={editFormData.code || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, code: e.currentTarget.value })}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 8 }}>
                            <TextInput
                                label="Nombre / Razón Social"
                                value={editFormData.name || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, name: e.currentTarget.value })}
                            />
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select
                                label="Giro comercial"
                                data={[
                                    'Comercial / Retail',
                                    'Gastronómico',
                                    'Salud y Farmacia',
                                    'Servicios y Belleza',
                                    'Oficina / Coworking',
                                    'Conveniencia',
                                ]}
                                value={editFormData.businessType || 'Comercial'}
                                onChange={(val) => setEditFormData({ ...editFormData, businessType: val || '' })}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select
                                label="Estado del local"
                                data={['Disponible', 'Ocupado', 'Mantenimiento', 'Reservado']}
                                value={editFormData.status || 'Disponible'}
                                onChange={(val) =>
                                    setEditFormData({ ...editFormData, status: val as LocalData['status'] })
                                }
                            />
                        </Grid.Col>

                        <Grid.Col span={{ base: 12, sm: 4 }}>
                            <NumberInput
                                label="Superficie (m²)"
                                value={editFormData.area || 0}
                                onChange={(val) => setEditFormData({ ...editFormData, area: Number(val) })}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                            <NumberInput
                                label="Renta Mensual ($)"
                                value={editFormData.monthlyRent || 0}
                                onChange={(val) => setEditFormData({ ...editFormData, monthlyRent: Number(val) })}
                            />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                            <NumberInput
                                label="Mantenimiento ($)"
                                value={editFormData.maintenanceFee || 0}
                                onChange={(val) => setEditFormData({ ...editFormData, maintenanceFee: Number(val) })}
                            />
                        </Grid.Col>
                    </Grid>

                    <Card withBorder radius="sm" p="sm" bg="var(--mantine-color-gray-0)">
                        <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="xs">
                            Datos del Locatario
                        </Text>
                        <Grid gap="xs">
                            <Grid.Col span={{ base: 12, sm: 4 }}>
                                <TextInput
                                    size="xs"
                                    label="Nombre"
                                    placeholder="Sin locatario"
                                    value={editFormData.tenantName || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, tenantName: e.currentTarget.value })}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 4 }}>
                                <TextInput
                                    size="xs"
                                    label="Email"
                                    placeholder="correo@ejemplo.com"
                                    value={editFormData.tenantMail || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, tenantMail: e.currentTarget.value })}
                                />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 4 }}>
                                <TextInput
                                    size="xs"
                                    label="Teléfono"
                                    placeholder="+52 ..."
                                    value={editFormData.tenantPhone || ''}
                                    onChange={(e) => setEditFormData({ ...editFormData, tenantPhone: e.currentTarget.value })}
                                />
                            </Grid.Col>
                        </Grid>
                    </Card>

                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={closeEditModal}>
                            Cancelar
                        </Button>
                        <Button color="yellow" onClick={handleSaveEdit}>
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
                                                <Text size="sm">{selectedLocal.tenantPhone}</Text>
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
