import { useState } from 'react';
import { ActionBar, ActionIcon, Badge, Box, Button, Card, Center, Checkbox, Flex, Grid, Group, Menu, SegmentedControl, Select, Stack, Table, Text, TextInput, ThemeIcon, Title } from '@mantine/core';
import { Head } from '@inertiajs/react';
import { IconBan, IconDotsVertical, IconEye, IconLayoutGrid, IconList, IconPencil, IconPlus, IconSearch, IconTrash, IconUser, IconX } from '@tabler/icons-react';
import { local } from '@/routes/storage';

interface UserData {
    userName: string;
    userLocation: string;
    userMail: string,
    userPhone: string,
    userActive: boolean,
    userProperty: string,
    propertyBuilding: string,
    propertyNumber: string,
    propertyLevel: string,
    propertyActive: boolean
}

const usersData: UserData[] = [
    {
        userName: "Carlos Mendoza",
        userLocation: "Torre Norte",
        userMail: "carlos.mendoza@email.com",
        userPhone: "+52 55 1234 5678",
        userActive: true,
        userProperty: "Departamento 301",
        propertyBuilding: "Torre A",
        propertyNumber: "301",
        propertyLevel: "Piso 3",
        propertyActive: true,
    },
    {
        userName: "Ana Sofía Rivas",
        userLocation: "Torre Sur",
        userMail: "ana.rivas@email.com",
        userPhone: "+52 55 8765 4321",
        userActive: true,
        userProperty: "Departamento 502",
        propertyBuilding: "Torre B",
        propertyNumber: "502",
        propertyLevel: "Piso 5",
        propertyActive: true,
    },
    {
        userName: "Miguel Ángel Ruiz",
        userLocation: "Plaza Comercial",
        userMail: "miguel.ruiz@email.com",
        userPhone: "+52 55 9876 1234",
        userActive: false,
        userProperty: "Local Comercial 04",
        propertyBuilding: "Torre C",
        propertyNumber: "LC-04",
        propertyLevel: "Planta Baja",
        propertyActive: false,
    },
    {
        userName: "Elena Gómez",
        userLocation: "Torre Norte",
        userMail: "elena.gomez@email.com",
        userPhone: "+52 55 4321 8765",
        userActive: true,
        userProperty: "Departamento 102",
        propertyBuilding: "Torre A",
        propertyNumber: "102",
        propertyLevel: "Piso 1",
        propertyActive: true,
    },
];

export default function UserList() {
  const [selection, setSelection] = useState<string[]>([]);

  const toggleRow = (userMail: string) =>
    setSelection((current) =>
      current.includes(userMail)
        ? current.filter((item) => item !== userMail)
        : [...current, userMail]
    );

  const toggleAll = () =>
    setSelection((current) =>
      current.length === usersData.length ? [] : usersData.map((user) => user.userMail)
    );

  const rows = usersData.map((user) => (
    <Table.Tr key={user.userMail}>
        <Table.Td>
            <Checkbox checked={selection.includes(user.userMail)} onChange={() => toggleRow(user.userMail)}/>
        </Table.Td>
        <Table.Td>{user.userName}</Table.Td>
        <Table.Td>{user.userMail}</Table.Td>
        <Table.Td>{user.userPhone}</Table.Td>
        <Table.Td>{user.userLocation}</Table.Td>
        <Table.Td>{user.propertyBuilding}</Table.Td>
        <Table.Td>{user.propertyLevel}</Table.Td>
        <Table.Td>{user.userProperty} ({user.propertyNumber})</Table.Td>
        <Table.Td>
            <Center>
                <Badge color={user.userActive ? 'green' : 'red'}>
                    {user.userActive ? 'Activo' : 'Inactivo'}
                </Badge>
            </Center>
        </Table.Td>
        <Table.Td>
            <Center>
                <Badge color={user.propertyActive ? 'green' : 'red'}>
                    {user.propertyActive ? 'Ocupada' : 'Desocupada'}
                </Badge>
            </Center>
        </Table.Td>
        <Table.Td>
            <Group gap="xs" justify="center" wrap="nowrap">
                <ActionIcon variant="subtle" color="blue"  title="Ver detalles">
                    <IconEye size={16} />
                </ActionIcon>
                <ActionIcon variant="subtle" color="yellow"  title="Editar">
                    <IconPencil size={16} />
                </ActionIcon>
                <Menu position="bottom-end" shadow="md">
                    <Menu.Target>
                        <ActionIcon variant="subtle" color="gray">
                            <IconDotsVertical size={16} />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <Menu.Item leftSection={<IconEye size={14} />}>
                            Ver detalles
                        </Menu.Item>
                        <Menu.Item leftSection={<IconPencil size={14} />}>
                            Editar local
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item color="red" leftSection={<IconTrash size={14} />} >
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
                <Flex gap="md" align="center">
                    <Center>
                        <ThemeIcon size={52} radius="md" color="green" variant="light">
                            <IconUser size={32} />
                        </ThemeIcon>
                    </Center>
                    <Box>
                    <Title order={2} fw={600}>
                        Gestión de Usuarios
                    </Title>
                    <Text c="dimmed" size="sm" mt={2}>
                        Administra los datos y estados de los locatarios
                    </Text>
                </Box>
            </Flex>

            <Button leftSection={<IconPlus size={18} />} color="blue" radius="md"// onClick={}
            >
                Nuevo Usuario
            </Button>
            </Flex>

            <Card withBorder radius="md" padding="md">
                <Grid align="center" gap="md">
                    <Grid.Col span={{ base: 12, md: 5 }}>
                        <TextInput
                            placeholder="Buscar por código, nombre, edificio o locatario..."
                            leftSection={<IconSearch size={16} />}
                            // value={searchQuery}
                            // onChange={(e) => setSearchQuery(e.currentTarget.value)}
                            // rightSection={
                            //     searchQuery ? (
                            //         <ActionIcon size="xs" variant="subtle" onClick={() => setSearchQuery('')}>
                            //             <IconX size={12} />
                            //         </ActionIcon>
                            //     ) : null
                            // }
                        />
                    </Grid.Col>

                    <Grid.Col span={{ base: 6, sm: 3, md: 2.5 }}>
                        <Select
                            placeholder="Estado"
                            clearable
                            // value={filterStatus}
                            // onChange={setFilterStatus}
                            // data={[
                            //     { value: 'todos', label: 'Todos los estados' },
                            //     { value: 'Ocupado', label: 'Ocupado' },
                            //     { value: 'Disponible', label: 'Disponible' },
                            //     { value: 'Mantenimiento', label: 'Mantenimiento' },
                            //     { value: 'Reservado', label: 'Reservado' },
                            // ]}
                        />
                    </Grid.Col>

                    <Grid.Col span={{ base: 6, sm: 3, md: 2.5 }}>
                        <Select
                            placeholder="Edificio"
                            clearable
                            // value={filterBuilding}
                            // onChange={setFilterBuilding}
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
                                // value={viewMode}
                                // onChange={(value) => setViewMode(value as 'table' | 'grid')}
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


            <Card withBorder radius="md" padding="lg" w="100%" h="100%">
                <Table.ScrollContainer  minWidth={300} maxHeight={500} >
                    <Table striped highlightOnHover>
                        <Table.Thead>
                        <Table.Tr>
                            <Table.Th>
                            <Checkbox
                                aria-label="Select all"
                                checked={selection.length === usersData.length}
                                indeterminate={selection.length > 0 && selection.length !== usersData.length}
                                onChange={toggleAll}
                            />
                            </Table.Th>
                            <Table.Th>Nombre</Table.Th>
                            <Table.Th>Email</Table.Th>
                            <Table.Th>Teléfono</Table.Th>
                            <Table.Th>Ubicación</Table.Th>
                            <Table.Th>Edificio</Table.Th>
                            <Table.Th>Nivel</Table.Th>
                            <Table.Th>Propiedad</Table.Th>
                            <Table.Th>Estado Usuario</Table.Th>
                            <Table.Th>Estado Propiedad</Table.Th>
                            <Table.Th ta="center">Acciones</Table.Th>
                        </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>{rows}</Table.Tbody>
                    </Table>
                </Table.ScrollContainer>
            </Card>

            <ActionBar opened={selection.length > 0} onClose={() => setSelection([])} shadow="md">
                <Text visibleFrom='xs' size="sm">{selection.length} seleccionados</Text>
                <ActionBar.Divider />

                <Button variant="filled" color="red" px={{ base: 'xs', sm: 'md' }}>
                    <IconTrash size={14} />
                    <Box visibleFrom="xs">Eliminar</Box>
                </Button>

                <Button variant="filled" color="yellow" px={{ base: 'xs', sm: 'md' }}>
                    <IconPencil size={14} />
                    <Box visibleFrom="xs">Editar</Box>
                </Button>

                <Button variant="filled" color="blue" px={{ base: 'xs', sm: 'md' }}>
                    <IconBan size={14} />
                    <Box visibleFrom="xs">Bloquear</Box>
                </Button>

                <ActionBar.CloseButton />
            </ActionBar>
        </Stack>
    </>
  );
}
