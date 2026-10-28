import { ActionIcon, Badge, Box, Button, Card, Center, Checkbox, Drawer, Flex, Grid, Group, Menu, Modal, NumberInput, RingProgress, Select, SimpleGrid, Stack, Table, Text, TextInput, ThemeIcon, Title } from '@mantine/core';
import { Head } from '@inertiajs/react';
import { IconAlertCircle, IconBuilding, IconBuildingStore, IconCalendar, IconCheck, IconDotsVertical, IconEye, IconMail, IconPencil, IconPhone, IconPlus, IconTools, IconTrash, IconUser } from '@tabler/icons-react';
import { TittlePage } from '@/matine-components/tittle-page';
import { FilterBox } from '@/matine-components/filter-box';
import { BulkActionBar } from '@/matine-components/BulkActionBar';
import type { LocalData } from '@/types/locales.types';
import { ESTADOS, GIROS, EDIFICIOS, NIVELES, withValue } from './constants/locales.constants';
import { useLocalesFilters } from './hooks/useLocalesFilters';
import { useLocalesActions } from './hooks/useLocalesActions';

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
    const filters = useLocalesFilters(locales);
    const actions = useLocalesActions(locales);

    return (
        <>
            <Head title="Gestión de Locales" />

            <Stack gap="xl" p="md" w="100%" h="100%">
                <Flex justify="space-between" align="center" wrap="wrap" gap="md">
                    <TittlePage title="Gestión de Locales" message="Control de ocupación, contratos y especificaciones de locales comerciales" icon={<IconBuildingStore size={40} color="var(--mantine-color-blue-8)" />} />
                    <Button leftSection={<IconPlus size={18} />} color="blue" radius="md" onClick={actions.handleOpenCreate}>Nuevo Local</Button>
                </Flex>

                <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
                    <Card withBorder radius="md" padding="md">
                        <Group justify="space-between" align="center">
                            <Box>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total de Locales</Text>
                                <Title order={3} fw={700} mt={4}>{filters.stats.totalLocales}</Title>
                                <Text size="xs" c="dimmed" mt={2}>Espacios comerciales</Text>
                            </Box>
                            <ThemeIcon color="blue" variant="light" size="xl" radius="md">
                                <IconBuilding size={24} />
                            </ThemeIcon>
                        </Group>
                    </Card>

                    <Card withBorder radius="md" padding="md">
                        <Group justify="space-between" align="center">
                            <Box>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Locales Ocupados</Text>
                                <Title order={3} fw={700} mt={4} c="green">{filters.stats.occupiedCount}</Title>
                                <Text size="xs" c="dimmed" mt={2}>{filters.stats.occupiedPercentage}% del total</Text>
                            </Box>
                            <RingProgress
                                size={52}
                                thickness={5}
                                roundCaps
                                sections={[{ value: filters.stats.occupiedPercentage, color: 'green' }]}
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
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Disponibles</Text>
                                <Title order={3} fw={700} mt={4} c="blue">{filters.stats.availableCount}</Title>
                                <Text size="xs" c="dimmed" mt={2}>Listos para arrendar</Text>
                            </Box>
                            <ThemeIcon color="blue" variant="light" size="xl" radius="md">
                                <IconBuildingStore size={24} />
                            </ThemeIcon>
                        </Group>
                    </Card>

                    <Card withBorder radius="md" padding="md">
                        <Group justify="space-between" align="center">
                            <Box>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Mantenimiento</Text>
                                <Title order={3} fw={700} mt={4} c="orange">{filters.stats.maintenanceCount}</Title>
                                <Text size="xs" c="dimmed" mt={2}>En acondicionamiento</Text>
                            </Box>
                            <ThemeIcon color="orange" variant="light" size="xl" radius="md">
                                <IconTools size={24} />
                            </ThemeIcon>
                        </Group>
                    </Card>
                </SimpleGrid>

                <FilterBox
                    searchQuery={filters.search}
                    setSearchQuery={filters.setSearch}
                    filterStatus={filters.status}
                    setFilterStatus={filters.setStatus}
                    filterBuilding={filters.building}
                    setFilterBuilding={filters.setBuilding}
                    statusOptions={filters.statusData}
                    buildingOptions={filters.buildingData}
                />

                <Card withBorder radius="md" padding="lg" w="100%">
                    <Table.ScrollContainer minWidth={850} maxHeight={600}>
                        <Table striped highlightOnHover verticalSpacing="sm">
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th w={40}>
                                        <Checkbox
                                            aria-label="Seleccionar todos"
                                            checked={actions.selection.length > 0 && actions.selection.length === filters.filteredLocales.length}
                                            indeterminate={actions.selection.length > 0 && actions.selection.length !== filters.filteredLocales.length}
                                            onChange={() => actions.toggleAll(filters.filteredLocales)}
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
                                {filters.filteredLocales.length === 0 ? (
                                    <Table.Tr>
                                        <Table.Td colSpan={9} ta="center" py="xl">
                                            <Flex direction="column" align="center" gap="xs">
                                                <IconAlertCircle size={32} color="gray" />
                                                <Text c="dimmed">No se encontraron locales con los filtros seleccionados.</Text>
                                            </Flex>
                                        </Table.Td>
                                    </Table.Tr>
                                ) : (
                                    filters.filteredLocales.map((local) => (
                                        <Table.Tr key={local.id}>
                                            <Table.Td>
                                                <Checkbox checked={actions.selection.includes(local.id)} onChange={() => actions.toggleRow(local.id)} />
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge variant="outline" color="blue" fw={700}>
                                                    {local.code}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text fw={600} size="sm">{local.name}</Text>
                                                <Text size="xs" c="dimmed">{local.businessType}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm">{local.building}</Text>
                                                <Text size="xs" c="dimmed">{local.level}</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm">{local.area} m²</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                {local.tenantName ? (
                                                    <Box>
                                                        <Text size="sm" fw={500}>{local.tenantName}</Text>
                                                        <Text size="xs" c="dimmed">{local.tenantMail ?? 'Sin email'}</Text>
                                                    </Box>
                                                ) : (
                                                    <Text size="xs" c="dimmed" fs="italic">Sin locatario asignado</Text>
                                                )}
                                            </Table.Td>
                                            <Table.Td>
                                                <Text fw={600} size="sm">${local.monthlyRent.toLocaleString('es-MX')} MXN</Text>
                                                <Text size="xs" c="dimmed">+ ${local.maintenanceFee.toLocaleString('es-MX')} mant.</Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Center>{getStatusBadge(local.status)}</Center>
                                            </Table.Td>
                                            <Table.Td>
                                                <Group gap="xs" justify="center">
                                                    <ActionIcon variant="subtle" color="blue" onClick={() => actions.handleViewDetail(local)} title="Ver detalles">
                                                        <IconEye size={16} />
                                                    </ActionIcon>
                                                    <ActionIcon variant="subtle" color="yellow" onClick={() => actions.handleOpenEdit(local)} title="Editar">
                                                        <IconPencil size={16} />
                                                    </ActionIcon>
                                                    <Menu position="bottom-end" shadow="md">
                                                        <Menu.Target>
                                                            <ActionIcon variant="subtle" color="gray">
                                                                <IconDotsVertical size={16} />
                                                            </ActionIcon>
                                                        </Menu.Target>
                                                        <Menu.Dropdown>
                                                            <Menu.Item leftSection={<IconEye size={14} />} onClick={() => actions.handleViewDetail(local)}>Ver detalles</Menu.Item>
                                                            <Menu.Item leftSection={<IconPencil size={14} />} onClick={() => actions.handleOpenEdit(local)}>Editar local</Menu.Item>
                                                            <Menu.Divider />
                                                            <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={() => actions.handleDeleteSingle(local)}>Eliminar</Menu.Item>
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

                <BulkActionBar selection={actions.selection} onClearSelection={() => actions.setSelection([])} onDeleteSelected={actions.handleDeleteSelected} onMarkAsAvailable={actions.handleMarkAsAvailable} itemName="locales" />
            </Stack>

            <Modal opened={actions.createModalOpened} onClose={actions.closeCreateModal} title={<Group gap="xs"><ThemeIcon color="blue" variant="light" size="md"><IconPlus size={16} /></ThemeIcon><Text fw={600}>Registrar Nuevo Local</Text></Group>} size="lg" radius="md">
                <Stack gap="md">
                    <Grid gap="md">
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                            <TextInput label="Código del local" placeholder="Ej: LC-11" required value={actions.createForm.data.code} error={actions.createForm.errors.code} onChange={(e) => actions.createForm.setData('code', e.currentTarget.value)} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 8 }}>
                            <TextInput label="Nombre / Razón Social" placeholder="Ej: Cafetería Central" required value={actions.createForm.data.name} error={actions.createForm.errors.name} onChange={(e) => actions.createForm.setData('name', e.currentTarget.value)} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select label="Giro o categoría comercial" data={GIROS} value={actions.createForm.data.businessType} error={actions.createForm.errors.businessType} onChange={(val) => actions.createForm.setData('businessType', val || 'Comercial / Retail')} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select label="Estado inicial" data={ESTADOS} value={actions.createForm.data.status} error={actions.createForm.errors.status} onChange={(val) => actions.createForm.setData('status', (val as LocalData['status']) || 'Disponible')} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select label="Edificio / Zona" data={EDIFICIOS} value={actions.createForm.data.building} error={actions.createForm.errors.building} onChange={(val) => actions.createForm.setData('building', val || 'Torre A')} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select label="Nivel / Piso" data={NIVELES} value={actions.createForm.data.level} error={actions.createForm.errors.level} onChange={(val) => actions.createForm.setData('level', val || 'Planta Baja')} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                            <NumberInput label="Superficie (m²)" min={10} max={1000} value={actions.createForm.data.area} error={actions.createForm.errors.area} onChange={(val) => actions.createForm.setData('area', val)} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                            <NumberInput label="Renta Mensual ($)" min={1000} step={1000} value={actions.createForm.data.monthlyRent} error={actions.createForm.errors.monthlyRent} onChange={(val) => actions.createForm.setData('monthlyRent', val)} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                            <NumberInput label="Mantenimiento ($)" min={500} step={500} value={actions.createForm.data.maintenanceFee} error={actions.createForm.errors.maintenanceFee} onChange={(val) => actions.createForm.setData('maintenanceFee', val)} />
                        </Grid.Col>
                    </Grid>

                    {actions.createForm.data.status === 'Ocupado' && (
                        <Card withBorder radius="sm" p="sm" bg="var(--mantine-color-gray-0)">
                            <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="xs">Información del Locatario</Text>
                            <Grid gap="xs">
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                    <TextInput size="xs" label="Nombre del locatario" placeholder="Nombre completo" value={actions.createForm.data.tenantName} error={actions.createForm.errors.tenantName} onChange={(e) => actions.createForm.setData('tenantName', e.currentTarget.value)} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                    <TextInput size="xs" label="Correo electrónico" placeholder="correo@ejemplo.com" value={actions.createForm.data.tenantMail} error={actions.createForm.errors.tenantMail} onChange={(e) => actions.createForm.setData('tenantMail', e.currentTarget.value)} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                    <TextInput size="xs" label="Teléfono" placeholder="+52 ..." value={actions.createForm.data.tenantPhone} error={actions.createForm.errors.tenantPhone} onChange={(e) => actions.createForm.setData('tenantPhone', e.currentTarget.value)} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 12, sm: 6 }}>
                                    <TextInput size="xs" type="date" label="Fin de contrato" value={actions.createForm.data.contractEnd} error={actions.createForm.errors.contractEnd} onChange={(e) => actions.createForm.setData('contractEnd', e.currentTarget.value)} />
                                </Grid.Col>
                            </Grid>
                            <Text size="xs" c="dimmed" mt="xs">Si el correo no existe se crea la cuenta del locatario; podrá definir su contraseña con "¿Olvidaste tu contraseña?".</Text>
                        </Card>
                    )}

                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={actions.closeCreateModal}>Cancelar</Button>
                        <Button color="blue" onClick={actions.handleCreateLocal} loading={actions.createForm.processing}>Guardar Local</Button>
                    </Group>
                </Stack>
            </Modal>

            <Modal opened={actions.editModalOpened} onClose={actions.closeEditModal} title={<Group gap="xs"><ThemeIcon color="yellow" variant="light" size="md"><IconPencil size={16} /></ThemeIcon><Text fw={600}>Editar Local {actions.selectedLocal?.code}</Text></Group>} size="lg" radius="md">
                <Stack gap="md">
                    <Grid gap="md">
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                            <TextInput label="Código del local" value={actions.editForm.data.code} error={actions.editForm.errors.code} onChange={(e) => actions.editForm.setData('code', e.currentTarget.value)} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 8 }}>
                            <TextInput label="Nombre / Razón Social" value={actions.editForm.data.name} error={actions.editForm.errors.name} onChange={(e) => actions.editForm.setData('name', e.currentTarget.value)} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select label="Giro comercial" data={withValue(GIROS, actions.editForm.data.businessType)} value={actions.editForm.data.businessType} error={actions.editForm.errors.businessType} onChange={(val) => actions.editForm.setData('businessType', val || '')} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select label="Estado del local" data={ESTADOS} value={actions.editForm.data.status} error={actions.editForm.errors.status} onChange={(val) => actions.editForm.setData('status', (val as LocalData['status']) || 'Disponible')} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select label="Edificio / Zona" data={withValue(EDIFICIOS, actions.editForm.data.building)} value={actions.editForm.data.building} error={actions.editForm.errors.building} onChange={(val) => actions.editForm.setData('building', val || 'Torre A')} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Select label="Nivel / Piso" data={withValue(NIVELES, actions.editForm.data.level)} value={actions.editForm.data.level} error={actions.editForm.errors.level} onChange={(val) => actions.editForm.setData('level', val || 'Planta Baja')} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                            <NumberInput label="Superficie (m²)" value={actions.editForm.data.area} error={actions.editForm.errors.area} onChange={(val) => actions.editForm.setData('area', val)} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                            <NumberInput label="Renta Mensual ($)" value={actions.editForm.data.monthlyRent} error={actions.editForm.errors.monthlyRent} onChange={(val) => actions.editForm.setData('monthlyRent', val)} />
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 4 }}>
                            <NumberInput label="Mantenimiento ($)" value={actions.editForm.data.maintenanceFee} error={actions.editForm.errors.maintenanceFee} onChange={(val) => actions.editForm.setData('maintenanceFee', val)} />
                        </Grid.Col>
                    </Grid>

                    <Card withBorder radius="sm" p="sm" bg="var(--mantine-color-gray-0)">
                        <Text size="xs" fw={700} tt="uppercase" c="dimmed" mb="xs">Datos del Locatario</Text>
                        <Grid gap="xs">
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <TextInput size="xs" label="Nombre" placeholder="Sin locatario" value={actions.editForm.data.tenantName} error={actions.editForm.errors.tenantName} onChange={(e) => actions.editForm.setData('tenantName', e.currentTarget.value)} />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <TextInput size="xs" label="Email" placeholder="correo@ejemplo.com" value={actions.editForm.data.tenantMail} error={actions.editForm.errors.tenantMail} onChange={(e) => actions.editForm.setData('tenantMail', e.currentTarget.value)} />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <TextInput size="xs" label="Teléfono" placeholder="+52 ..." value={actions.editForm.data.tenantPhone} error={actions.editForm.errors.tenantPhone} onChange={(e) => actions.editForm.setData('tenantPhone', e.currentTarget.value)} />
                            </Grid.Col>
                            <Grid.Col span={{ base: 12, sm: 6 }}>
                                <TextInput size="xs" type="date" label="Fin de contrato" value={actions.editForm.data.contractEnd} error={actions.editForm.errors.contractEnd} onChange={(e) => actions.editForm.setData('contractEnd', e.currentTarget.value)} />
                            </Grid.Col>
                        </Grid>
                        <Text size="xs" c="dimmed" mt="xs">Deja el nombre y el correo vacíos para quitar al locatario del local.</Text>
                    </Card>

                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={actions.closeEditModal}>Cancelar</Button>
                        <Button color="yellow" onClick={actions.handleSaveEdit} loading={actions.editForm.processing}>Actualizar Local</Button>
                    </Group>
                </Stack>
            </Modal>

            <Drawer opened={actions.detailDrawerOpened} onClose={actions.closeDetailDrawer} title={actions.selectedLocal ? <Group gap="xs"><Badge size="lg" color="blue" variant="filled">{actions.selectedLocal.code}</Badge><Text fw={700} size="md">{actions.selectedLocal.name}</Text></Group> : null} position="right" size="md" overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}>
                {actions.selectedLocal && (
                    <Stack gap="lg" mt="md">
                        <Card withBorder radius="md" p="md">
                            <Group justify="space-between" mb="xs">
                                <Text size="xs" tt="uppercase" fw={700} c="dimmed">Estado Actual</Text>
                                {getStatusBadge(actions.selectedLocal.status)}
                            </Group>
                            <Text size="sm" c="dimmed">Giro comercial: <Text span fw={600} c="dark">{actions.selectedLocal.businessType}</Text></Text>
                        </Card>

                        <Box>
                            <Text fw={700} size="sm" mb="xs">Ubicación y Dimensiones</Text>
                            <SimpleGrid cols={2} spacing="xs">
                                <Card withBorder radius="sm" p="xs"><Text size="xs" c="dimmed">Edificio</Text><Text fw={600} size="sm">{actions.selectedLocal.building}</Text></Card>
                                <Card withBorder radius="sm" p="xs"><Text size="xs" c="dimmed">Nivel / Piso</Text><Text fw={600} size="sm">{actions.selectedLocal.level}</Text></Card>
                                <Card withBorder radius="sm" p="xs"><Text size="xs" c="dimmed">Superficie Total</Text><Text fw={600} size="sm">{actions.selectedLocal.area} m²</Text></Card>
                                <Card withBorder radius="sm" p="xs"><Text size="xs" c="dimmed">Identificador</Text><Text fw={600} size="sm">{actions.selectedLocal.code}</Text></Card>
                            </SimpleGrid>
                        </Box>

                        <Box>
                            <Text fw={700} size="sm" mb="xs">Aspectos Financieros</Text>
                            <Stack gap="xs">
                                <Card withBorder radius="sm" p="sm"><Flex justify="space-between" align="center"><Text size="sm">Renta Mensual:</Text><Text fw={700} size="md" c="blue">${actions.selectedLocal.monthlyRent.toLocaleString('es-MX')} MXN</Text></Flex></Card>
                                <Card withBorder radius="sm" p="sm"><Flex justify="space-between" align="center"><Text size="sm">Cuota Mantenimiento:</Text><Text fw={700} size="sm">${actions.selectedLocal.maintenanceFee.toLocaleString('es-MX')} MXN</Text></Flex></Card>
                            </Stack>
                        </Box>

                        <Box>
                            <Text fw={700} size="sm" mb="xs">Información de Ocupación</Text>
                            {actions.selectedLocal.tenantName ? (
                                <Card withBorder radius="md" p="md">
                                    <Stack gap="xs">
                                        <Flex align="center" gap="xs"><IconUser size={18} color="var(--mantine-color-blue-6)" /><Box><Text size="xs" c="dimmed">Locatario actual</Text><Text size="sm" fw={600}>{actions.selectedLocal.tenantName}</Text></Box></Flex>
                                        <Flex align="center" gap="xs"><IconMail size={18} color="var(--mantine-color-blue-6)" /><Box><Text size="xs" c="dimmed">Correo electrónico</Text><Text size="sm">{actions.selectedLocal.tenantMail}</Text></Box></Flex>
                                        <Flex align="center" gap="xs"><IconPhone size={18} color="var(--mantine-color-blue-6)" /><Box><Text size="xs" c="dimmed">Teléfono de contacto</Text><Text size="sm">{actions.selectedLocal.tenantPhone ?? 'Sin teléfono'}</Text></Box></Flex>
                                        {actions.selectedLocal.contractEnd && <Flex align="center" gap="xs"><IconCalendar size={18} color="var(--mantine-color-blue-6)" /><Box><Text size="xs" c="dimmed">Fin de Contrato</Text><Text size="sm" fw={600}>{actions.selectedLocal.contractEnd}</Text></Box></Flex>}
                                    </Stack>
                                </Card>
                            ) : (
                                <Card withBorder radius="md" p="md" bg="var(--mantine-color-blue-0)">
                                    <Center py="sm">
                                        <Stack align="center" gap="xs">
                                            <IconBuildingStore size={32} color="var(--mantine-color-blue-6)" />
                                            <Text fw={600} size="sm" c="blue">Este local no tiene locatario asignado</Text>
                                            <Text size="xs" c="dimmed" ta="center">Está listo para ser ofertado en arrendamiento o asignado a un nuevo inquilino.</Text>
                                        </Stack>
                                    </Center>
                                </Card>
                            )}
                        </Box>

                        <Group justify="flex-end" mt="md">
                            <Button variant="outline" color="yellow" leftSection={<IconPencil size={16} />} onClick={() => { actions.closeDetailDrawer(); actions.handleOpenEdit(actions.selectedLocal!); }}>Editar Local</Button>
                        </Group>
                    </Stack>
                )}
            </Drawer>
        </>
    );
}
