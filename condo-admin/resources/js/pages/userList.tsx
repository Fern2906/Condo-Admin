import { useMemo, useState } from 'react';
import { ActionBar, ActionIcon, Badge, Box, Button, Card, Center, Checkbox, Drawer, Flex, Grid, Group, Menu, Modal, Stack, Switch, Table, Text, TextInput, ThemeIcon } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { IconAlertCircle, IconBan, IconBuildingStore, IconDotsVertical, IconEye, IconMail, IconPencil, IconPhone, IconPlus, IconTrash, IconUser } from '@tabler/icons-react';
import UserController from '@/actions/App/Http/Controllers/UserController';
import { TittlePage } from '@/matine-components/tittle-page';
import { FilterBox } from '@/matine-components/filter-box';
import type { Auth } from '@/types';

// Forma que entrega App\Http\Resources\UserResource
interface UserData {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    altPhone: string | null;
    rfc: string | null;
    emergencyContact: string | null;
    emergencyPhone: string | null;
    active: boolean;
    verified: boolean;
    local: {
        id: number;
        code: string;
        name: string;
        building: string;
        level: string;
        status: string;
    } | null;
    localesCount: number;
}

// Campos que valida App\Http\Requests\UserRequest
type UserForm = {
    name: string;
    email: string;
    phone: string;
    altPhone: string;
    rfc: string;
    emergencyContact: string;
    emergencyPhone: string;
    active: boolean;
};

const emptyUser: UserForm = {
    name: '',
    email: '',
    phone: '',
    altPhone: '',
    rfc: '',
    emergencyContact: '',
    emergencyPhone: '',
    active: true,
};

const toForm = (user: UserData): UserForm => ({
    name: user.name,
    email: user.email,
    phone: user.phone ?? '',
    altPhone: user.altPhone ?? '',
    rfc: user.rfc ?? '',
    emergencyContact: user.emergencyContact ?? '',
    emergencyPhone: user.emergencyPhone ?? '',
    active: user.active,
});

const statusData = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
];

const localStatusColor: Record<string, string> = {
    Ocupado: 'green',
    Disponible: 'blue',
    Mantenimiento: 'orange',
    Reservado: 'grape',
};

export default function UserList({ users }: { users: UserData[] }) {
  const { auth } = usePage<{ auth: Auth }>().props;
  const [selection, setSelection] = useState<number[]>([]);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string[]>([]);
  const [building, setBuilding] = useState<string[]>([]);

  const [formModalOpened, { open: openFormModal, close: closeFormModal }] = useDisclosure(false);
  const [detailDrawerOpened, { open: openDetailDrawer, close: closeDetailDrawer }] = useDisclosure(false);

  // null = alta de un usuario nuevo; número = edición de ese usuario.
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedUser = users.find((u) => u.id === selectedId) ?? null;

  const form = useForm<UserForm>(emptyUser);

  const buildingData = useMemo(
    () =>
      [...new Set(users.flatMap((u) => (u.local ? [u.local.building] : [])))]
        .sort()
        .map((b) => ({ value: b, label: b })),
    [users]
  );

  const filteredUsers = useMemo(() => {
    const query = search.toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        query === '' ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.local?.code.toLowerCase().includes(query) ?? false) ||
        (user.local?.building.toLowerCase().includes(query) ?? false);

      const matchesStatus = status.length === 0 || status.includes(user.active ? 'activo' : 'inactivo');
      const matchesBuilding = building.length === 0 || (user.local !== null && building.includes(user.local.building));

      return matchesSearch && matchesStatus && matchesBuilding;
    });
  }, [users, search, status, building]);

  const toggleRow = (id: number) =>
    setSelection((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );

  const toggleAll = () =>
    setSelection((current) =>
      current.length === filteredUsers.length ? [] : filteredUsers.map((user) => user.id)
    );

  const handleOpenCreate = () => {
    setEditingId(null);
    form.clearErrors();
    form.setData(emptyUser);
    openFormModal();
  };

  const handleOpenEdit = (user: UserData) => {
    setEditingId(user.id);
    form.clearErrors();
    form.setData(toForm(user));
    openFormModal();
  };

  const handleViewDetail = (user: UserData) => {
    setSelectedId(user.id);
    openDetailDrawer();
  };

  const handleSubmit = () => {
    form.submit(editingId === null ? UserController.store() : UserController.update(editingId), {
      preserveScroll: true,
      onSuccess: () => {
        closeFormModal();
        form.reset();
      },
    });
  };

  const handleDelete = (user: UserData) => {
    if (!window.confirm(`¿Eliminar a ${user.name}? Esta acción no se puede deshacer.`)) return;
    router.delete(UserController.destroy(user.id), {
      preserveScroll: true,
      onSuccess: () => setSelection((prev) => prev.filter((id) => id !== user.id)),
    });
  };

  const handleDeleteSelected = () => {
    if (!window.confirm(`¿Eliminar ${selection.length} usuarios? Esta acción no se puede deshacer.`)) return;
    router.delete(UserController.destroyMany(), {
      data: { ids: selection },
      preserveScroll: true,
      onSuccess: () => setSelection([]),
    });
  };

  const handleBlockSelected = () => {
    router.patch(
      UserController.updateStatus(),
      { ids: selection, active: false },
      { preserveScroll: true, onSuccess: () => setSelection([]) }
    );
  };

  const handleEditSelected = () => {
    const user = users.find((u) => u.id === selection[0]);
    if (user) handleOpenEdit(user);
  };

  const rows = filteredUsers.map((user) => (
    <Table.Tr key={user.id}>
        <Table.Td>
            <Checkbox checked={selection.includes(user.id)} onChange={() => toggleRow(user.id)}/>
        </Table.Td>
        <Table.Td>{user.name}</Table.Td>
        <Table.Td>{user.email}</Table.Td>
        <Table.Td>{user.phone ?? '—'}</Table.Td>
        <Table.Td>{user.local?.building ?? '—'}</Table.Td>
        <Table.Td>{user.local?.level ?? '—'}</Table.Td>
        <Table.Td>
            {user.local ? `${user.local.name} (${user.local.code})` : (
                <Text size="xs" c="dimmed" fs="italic">Sin local asignado</Text>
            )}
        </Table.Td>
        <Table.Td>
            <Center>
                <Badge color={user.active ? 'green' : 'red'}>
                    {user.active ? 'Activo' : 'Inactivo'}
                </Badge>
            </Center>
        </Table.Td>
        <Table.Td>
            <Center>
                {user.local ? (
                    <Badge color={localStatusColor[user.local.status] ?? 'gray'} variant="light">
                        {user.local.status}
                    </Badge>
                ) : '—'}
            </Center>
        </Table.Td>
        <Table.Td>
            <Group gap="xs" justify="center" wrap="nowrap">
                <ActionIcon variant="subtle" color="blue" title="Ver detalles" onClick={() => handleViewDetail(user)}>
                    <IconEye size={16} />
                </ActionIcon>
                <ActionIcon variant="subtle" color="yellow" title="Editar" onClick={() => handleOpenEdit(user)}>
                    <IconPencil size={16} />
                </ActionIcon>
                <Menu position="bottom-end" shadow="md">
                    <Menu.Target>
                        <ActionIcon variant="subtle" color="gray">
                            <IconDotsVertical size={16} />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item leftSection={<IconEye size={14} />} onClick={() => handleViewDetail(user)}>
                            Ver detalles
                        </Menu.Item>
                        <Menu.Item leftSection={<IconPencil size={14} />} onClick={() => handleOpenEdit(user)}>
                            Editar usuario
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item color="red" leftSection={<IconTrash size={14} />} disabled={user.id === auth.user.id} onClick={() => handleDelete(user)}>
                            Eliminar
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>
        </Table.Td>
    </Table.Tr>
));

  return (
    <>
        <Head title="Lista de usuarios" />


        <Stack gap={"xl"} p={"md"} w="100%" h="100%">
            <Flex justify="space-between" align="center" wrap="wrap" gap="md">
                <TittlePage title="Gestión de Usuarios" message="Administra los datos y estados de los locatarios" icon={<IconUser size={40} color='var(--mantine-color-blue-8)'/>} />
                <Button leftSection={<IconPlus size={18} />} color="blue" radius="md" onClick={handleOpenCreate}>Nuevo Usuario</Button>
            </Flex>

            <FilterBox searchQuery={search}
                setSearchQuery={setSearch}
                filterStatus={status}
                setFilterStatus={setStatus}
                filterBuilding={building}
                setFilterBuilding={setBuilding}
                statusOptions={statusData}
                buildingOptions={buildingData} />

            <Card withBorder radius="md" padding="lg" w="100%" h="100%">
                <Table.ScrollContainer  minWidth={300} maxHeight={500} >
                    <Table striped highlightOnHover>
                        <Table.Thead>
                        <Table.Tr>
                            <Table.Th>
                            <Checkbox
                                aria-label="Select all"
                                checked={selection.length > 0 && selection.length === filteredUsers.length}
                                indeterminate={selection.length > 0 && selection.length !== filteredUsers.length}
                                onChange={toggleAll}
                            />
                            </Table.Th>
                            <Table.Th>Nombre</Table.Th>
                            <Table.Th>Email</Table.Th>
                            <Table.Th>Teléfono</Table.Th>
                            <Table.Th>Edificio</Table.Th>
                            <Table.Th>Nivel</Table.Th>
                            <Table.Th>Local</Table.Th>
                            <Table.Th>Estado Usuario</Table.Th>
                            <Table.Th>Estado Local</Table.Th>
                            <Table.Th ta="center">Acciones</Table.Th>
                        </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {rows.length > 0 ? rows : (
                                <Table.Tr>
                                    <Table.Td colSpan={10} ta="center" py="xl">
                                        <Flex direction="column" align="center" gap="xs">
                                            <IconAlertCircle size={32} color="gray" />
                                            <Text c="dimmed">No se encontraron usuarios con los filtros seleccionados.</Text>
                                        </Flex>
                                    </Table.Td>
                                </Table.Tr>
                            )}
                        </Table.Tbody>
                    </Table>
                </Table.ScrollContainer>
            </Card>

            <ActionBar opened={selection.length > 0} onClose={() => setSelection([])} shadow="md">
                <Text visibleFrom='xs' size="sm">{selection.length} seleccionados</Text>
                <ActionBar.Divider />

                <Button variant="filled" color="red" px={{ base: 'xs', sm: 'md' }} onClick={handleDeleteSelected}>
                    <IconTrash size={14} />
                    <Box visibleFrom="xs">Eliminar</Box>
                </Button>

                <Button variant="filled" color="yellow" px={{ base: 'xs', sm: 'md' }} disabled={selection.length !== 1} onClick={handleEditSelected}>
                    <IconPencil size={14} />
                    <Box visibleFrom="xs">Editar</Box>
                </Button>

                <Button variant="filled" color="blue" px={{ base: 'xs', sm: 'md' }} onClick={handleBlockSelected}>
                    <IconBan size={14} />
                    <Box visibleFrom="xs">Bloquear</Box>
                </Button>

                <ActionBar.CloseButton />
            </ActionBar>
        </Stack>

        {/* Modal: Alta / Edición de usuario */}
        <Modal
            opened={formModalOpened}
            onClose={closeFormModal}
            title={
                <Group gap="xs">
                    <ThemeIcon color={editingId === null ? 'blue' : 'yellow'} variant="light" size="md">
                        {editingId === null ? <IconPlus size={16} /> : <IconPencil size={16} />}
                    </ThemeIcon>
                    <Text fw={600}>{editingId === null ? 'Registrar Nuevo Usuario' : 'Editar Usuario'}</Text>
                </Group>
            }
            size="lg"
            radius="md"
        >
            <Stack gap="md">
                <Grid gap="md">
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                        <TextInput label="Nombre completo" required value={form.data.name} error={form.errors.name}
                            onChange={(e) => form.setData('name', e.currentTarget.value)} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                        <TextInput label="Correo electrónico" type="email" required value={form.data.email} error={form.errors.email}
                            onChange={(e) => form.setData('email', e.currentTarget.value)} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                        <TextInput label="Teléfono" placeholder="+52 ..." value={form.data.phone} error={form.errors.phone}
                            onChange={(e) => form.setData('phone', e.currentTarget.value)} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                        <TextInput label="Teléfono alterno" value={form.data.altPhone} error={form.errors.altPhone}
                            onChange={(e) => form.setData('altPhone', e.currentTarget.value)} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 4 }}>
                        <TextInput label="RFC" value={form.data.rfc} error={form.errors.rfc}
                            onChange={(e) => form.setData('rfc', e.currentTarget.value.toUpperCase())} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                        <TextInput label="Contacto de emergencia" value={form.data.emergencyContact} error={form.errors.emergencyContact}
                            onChange={(e) => form.setData('emergencyContact', e.currentTarget.value)} />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                        <TextInput label="Teléfono de emergencia" value={form.data.emergencyPhone} error={form.errors.emergencyPhone}
                            onChange={(e) => form.setData('emergencyPhone', e.currentTarget.value)} />
                    </Grid.Col>
                </Grid>

                <Switch
                    label="Usuario activo"
                    description="Un usuario inactivo (bloqueado) no puede iniciar sesión."
                    checked={form.data.active}
                    disabled={editingId === auth.user.id}
                    onChange={(e) => form.setData('active', e.currentTarget.checked)}
                />

                {editingId === null && (
                    <Text size="xs" c="dimmed">
                        El usuario podrá definir su contraseña con "¿Olvidaste tu contraseña?" en la pantalla de inicio de sesión.
                    </Text>
                )}

                <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={closeFormModal}>
                        Cancelar
                    </Button>
                    <Button color={editingId === null ? 'blue' : 'yellow'} onClick={handleSubmit} loading={form.processing}>
                        {editingId === null ? 'Guardar Usuario' : 'Actualizar Usuario'}
                    </Button>
                </Group>
            </Stack>
        </Modal>

        {/* Drawer: Detalles del usuario */}
        <Drawer
            opened={detailDrawerOpened}
            onClose={closeDetailDrawer}
            title={selectedUser ? <Text fw={700} size="md">{selectedUser.name}</Text> : null}
            position="right"
            size="md"
            overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
        >
            {selectedUser && (
                <Stack gap="lg" mt="md">
                    <Card withBorder radius="md" p="md">
                        <Group justify="space-between">
                            <Text size="xs" tt="uppercase" fw={700} c="dimmed">Estado</Text>
                            <Group gap="xs">
                                <Badge color={selectedUser.active ? 'green' : 'red'}>
                                    {selectedUser.active ? 'Activo' : 'Inactivo'}
                                </Badge>
                                {!selectedUser.verified && <Badge color="gray" variant="light">Correo sin verificar</Badge>}
                            </Group>
                        </Group>
                    </Card>

                    <Card withBorder radius="md" p="md">
                        <Stack gap="xs">
                            <Flex align="center" gap="xs">
                                <IconMail size={18} color="var(--mantine-color-blue-6)" />
                                <Box>
                                    <Text size="xs" c="dimmed">Correo electrónico</Text>
                                    <Text size="sm">{selectedUser.email}</Text>
                                </Box>
                            </Flex>
                            <Flex align="center" gap="xs">
                                <IconPhone size={18} color="var(--mantine-color-blue-6)" />
                                <Box>
                                    <Text size="xs" c="dimmed">Teléfono / alterno</Text>
                                    <Text size="sm">{selectedUser.phone ?? '—'} / {selectedUser.altPhone ?? '—'}</Text>
                                </Box>
                            </Flex>
                            <Flex align="center" gap="xs">
                                <IconUser size={18} color="var(--mantine-color-blue-6)" />
                                <Box>
                                    <Text size="xs" c="dimmed">Contacto de emergencia</Text>
                                    <Text size="sm">
                                        {selectedUser.emergencyContact ?? '—'} {selectedUser.emergencyPhone ? `(${selectedUser.emergencyPhone})` : ''}
                                    </Text>
                                </Box>
                            </Flex>
                            <Box>
                                <Text size="xs" c="dimmed">RFC</Text>
                                <Text size="sm">{selectedUser.rfc ?? '—'}</Text>
                            </Box>
                        </Stack>
                    </Card>

                    <Box>
                        <Text fw={700} size="sm" mb="xs">Local</Text>
                        {selectedUser.local ? (
                            <Card withBorder radius="md" p="md">
                                <Flex align="center" gap="xs">
                                    <IconBuildingStore size={18} color="var(--mantine-color-blue-6)" />
                                    <Box>
                                        <Text size="sm" fw={600}>{selectedUser.local.name} ({selectedUser.local.code})</Text>
                                        <Text size="xs" c="dimmed">{selectedUser.local.building} · {selectedUser.local.level}</Text>
                                    </Box>
                                </Flex>
                                {selectedUser.localesCount > 1 && (
                                    <Text size="xs" c="dimmed" mt="xs">Y {selectedUser.localesCount - 1} locales más.</Text>
                                )}
                            </Card>
                        ) : (
                            <Text size="sm" c="dimmed" fs="italic">
                                Sin local asignado. Se asigna desde la página de Locales.
                            </Text>
                        )}
                    </Box>

                    <Group justify="flex-end">
                        <Button
                            variant="outline"
                            color="yellow"
                            leftSection={<IconPencil size={16} />}
                            onClick={() => {
                                closeDetailDrawer();
                                handleOpenEdit(selectedUser);
                            }}
                        >
                            Editar Usuario
                        </Button>
                    </Group>
                </Stack>
            )}
        </Drawer>
    </>
  );
}
