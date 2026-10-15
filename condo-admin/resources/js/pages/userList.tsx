import { useState } from 'react';
import { ActionBar, Badge, Box, Button, Card, Center, Checkbox, Flex, Stack, Table, Text, Title } from '@mantine/core';
import { Head } from '@inertiajs/react';
import { IconBan, IconPencil, IconTrash, IconUser } from '@tabler/icons-react';

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

const elements = [
  { position: 6, mass: 12.011, symbol: 'C', name: 'Carbon' },
  { position: 7, mass: 14.007, symbol: 'N', name: 'Nitrogen' },
  { position: 39, mass: 88.906, symbol: 'Y', name: 'Yttrium' },
  { position: 56, mass: 137.33, symbol: 'Ba', name: 'Barium' },
  { position: 58, mass: 140.12, symbol: 'Ce', name: 'Cerium' },
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
            <Checkbox
                checked={selection.includes(user.userMail)}
                onChange={() => toggleRow(user.userMail)}
            />
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
    </Table.Tr>
));

  return (
    <>
        <Head title="Lista de usuarios" />

        <Stack gap={"xl"} p={"md"}>
            <Flex gap="md" align="center">
                <Center>
                    <IconUser size={40} />
                </Center>
                <Box>
                    <Title order={2} fw={600}>
                        Lista de usuarios   
                    </Title>
                    <Text c="dimmed" size="sm" mt={4}>
                            Gestión de usuarios del condominio
                    </Text>
                </Box>
            </Flex>

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
