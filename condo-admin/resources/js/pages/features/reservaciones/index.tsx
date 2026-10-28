import { ActionIcon, Badge, Box, Button, Card, Center, Checkbox, Drawer, Flex, Grid, Group, Menu, Modal, MultiSelect, NumberInput, Select, SimpleGrid, Stack, Switch, Table, Text, Textarea, TextInput, ThemeIcon } from '@mantine/core';
import { Head, router } from '@inertiajs/react';
import { IconAlertCircle, IconBuilding, IconCalendar, IconCalendarClock, IconCheck, IconClock, IconDotsVertical, IconEye, IconLock, IconPencil, IconPlus, IconTrash, IconUsers, IconX } from '@tabler/icons-react';
import { TittlePage } from '@/matine-components/tittle-page';
import type { AreaComunData, ReservacionData } from '@/types/reservaciones.types';
import { estadoColor } from './constants/reservaciones.constants';
import { useReservacionesFilters } from './hooks/useReservacionesFilters';
import { useReservacionesActions } from './hooks/useReservacionesActions';

const getEstadoBadge = (estado: ReservacionData['estado']) => (
    <Badge color={estadoColor[estado]} variant="light">
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
    </Badge>
);

export default function ReservacionesPage({
    reservaciones,
    areas,
    usuarios,
}: {
    reservaciones: ReservacionData[];
    areas: AreaComunData[];
    usuarios: { id: number; name: string; email: string }[];
}) {
    const filters = useReservacionesFilters(reservaciones, areas);
    const actions = useReservacionesActions(reservaciones);

    const areaOptions = areas.map((a) => ({ value: String(a.id), label: a.nombre }));
    const usuarioOptions = usuarios.map((u) => ({ value: String(u.id), label: `${u.name} (${u.email})` }));

    return (
        <>
            <Head title="Reservaciones" />

            <Stack gap="xl" p="md" w="100%" h="100%">
                <Flex justify="space-between" align="center" wrap="wrap" gap="md">
                    <TittlePage
                        title="Reservaciones y Áreas Comunes"
                        message="Gestiona las reservaciones y configura las áreas comunes del condominio"
                        icon={<IconCalendarClock size={40} color="var(--mantine-color-blue-8)" />}
                    />
                    <Group gap="sm">
                        <Button leftSection={<IconPlus size={18} />} color="blue" radius="md" onClick={actions.handleOpenCreateRes}>
                            Nueva Reservación
                        </Button>
                        <Button leftSection={<IconPlus size={18} />} variant="outline" color="blue" radius="md" onClick={actions.handleOpenCreateArea}>
                            Nueva Área
                        </Button>
                    </Group>
                </Flex>

                <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
                    <Card withBorder radius="md" padding="md">
                        <Group justify="space-between" align="center">
                            <Box>
                                <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Total</Text>
                                <Text fw={700} size="xl" mt={4}>{filters.stats.total}</Text>
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
                                <Text fw={700} size="xl" mt={4} c="yellow">{filters.stats.pendientes}</Text>
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
                                <Text fw={700} size="xl" mt={4} c="green">{filters.stats.aprobadas}</Text>
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
                                <Text fw={700} size="xl" mt={4} c="orange">{filters.stats.hoy}</Text>
                                <Text size="xs" c="dimmed" mt={2}>Reservaciones del día</Text>
                            </Box>
                            <ThemeIcon color="orange" variant="light" size="xl" radius="md">
                                <IconCalendarClock size={24} />
                            </ThemeIcon>
                        </Group>
                    </Card>
                </SimpleGrid>

                <Group gap={0} w="100%">
                    <Button variant={filters.activeTab === 'reservaciones' ? 'filled' : 'subtle'} color="blue" radius={0} style={{ borderRadius: '8px 0 0 8px' }} onClick={() => { filters.setActiveTab('reservaciones'); actions.setSelection([]); }}>
                        <IconCalendar size={16} style={{ marginRight: 6 }} />
                        Reservaciones
                    </Button>
                    <Button variant={filters.activeTab === 'areas' ? 'filled' : 'subtle'} color="blue" radius={0} style={{ borderRadius: '0 8px 8px 0' }} onClick={() => filters.setActiveTab('areas')}>
                        <IconBuilding size={16} style={{ marginRight: 6 }} />
                        Áreas Comunes
                    </Button>
                </Group>

                {filters.activeTab === 'reservaciones' && (
                    <Stack gap="md">
                        <Card withBorder radius="md" padding="md">
                            <Grid align="center" gap="md">
                                <Grid.Col span={{ base: 12, md: 4 }}>
                                    <TextInput placeholder="Buscar por área, usuario o fecha…" leftSection={<IconCalendar size={16} />} value={filters.searchRes} onChange={(e) => filters.setSearchRes(e.currentTarget.value)} rightSection={filters.searchRes ? <ActionIcon size="xs" variant="subtle" onClick={() => filters.setSearchRes('')}><IconX size={12} /></ActionIcon> : null} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 6, md: 4 }}>
                                    <MultiSelect placeholder="Estado" clearable value={filters.filterEstado} onChange={filters.setFilterEstado} data={filters.estadoOptions} />
                                </Grid.Col>
                                <Grid.Col span={{ base: 6, md: 4 }}>
                                    <MultiSelect placeholder="Área común" clearable searchable value={filters.filterArea} onChange={filters.setFilterArea} data={filters.areaFilterOptions} />
                                </Grid.Col>
                            </Grid>
                        </Card>

                        <Card withBorder radius="md" padding="lg" w="100%">
                            <Table.ScrollContainer minWidth={800} maxHeight={600}>
                                <Table striped highlightOnHover verticalSpacing="sm">
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th w={40}>
                                                <Checkbox aria-label="Seleccionar todas" checked={actions.selection.length > 0 && actions.selection.length === filters.filteredRes.length} indeterminate={actions.selection.length > 0 && actions.selection.length !== filters.filteredRes.length} onChange={() => actions.toggleAll(filters.filteredRes)} />
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
                                        {filters.filteredRes.length === 0 ? (
                                            <Table.Tr>
                                                <Table.Td colSpan={9} ta="center" py="xl">
                                                    <Flex direction="column" align="center" gap="xs">
                                                        <IconAlertCircle size={32} color="gray" />
                                                        <Text c="dimmed">No se encontraron reservaciones with los filtros seleccionados.</Text>
                                                    </Flex>
                                                </Table.Td>
                                            </Table.Tr>
                                        ) : (
                                            filters.filteredRes.map((r) => (
                                                <Table.Tr key={r.id}>
                                                    <Table.Td>
                                                        <Checkbox checked={actions.selection.includes(r.id)} onChange={() => actions.toggleRow(r.id)} />
                                                    </Table.Td>
                                                    <Table.Td><Text fw={600} size="sm">{r.areaComunNombre}</Text></Table.Td>
                                                    <Table.Td><Text size="sm" fw={500}>{r.usuarioNombre}</Text><Text size="xs" c="dimmed">{r.usuarioEmail}</Text></Table.Td>
                                                    <Table.Td><Text size="sm">{r.fecha}</Text></Table.Td>
                                                    <Table.Td><Text size="sm">{r.horaInicio} – {r.horaFin}</Text></Table.Td>
                                                    <Table.Td><Text size="sm">{r.numAsistentes ?? '—'}</Text></Table.Td>
                                                    <Table.Td><Text size="sm" lineClamp={1}>{r.motivo ?? '—'}</Text></Table.Td>
                                                    <Table.Td><Center>{getEstadoBadge(r.estado)}</Center></Table.Td>
                                                    <Table.Td>
                                                        <Group gap="xs" justify="center">
                                                            <ActionIcon variant="subtle" color="blue" onClick={() => actions.handleViewDetail(r)} title="Ver detalles"><IconEye size={16} /></ActionIcon>
                                                            <ActionIcon variant="subtle" color="yellow" onClick={() => actions.handleOpenEditRes(r)} title="Editar"><IconPencil size={16} /></ActionIcon>
                                                            <Menu position="bottom-end" shadow="md">
                                                                <Menu.Target>
                                                                    <ActionIcon variant="subtle" color="gray"><IconDotsVertical size={16} /></ActionIcon>
                                                                </Menu.Target>
                                                                <Menu.Dropdown>
                                                                    <Menu.Item leftSection={<IconEye size={14} />} onClick={() => actions.handleViewDetail(r)}>Ver detalles</Menu.Item>
                                                                    <Menu.Item leftSection={<IconCheck size={14} />} color="green" onClick={() => router.patch('/reservaciones/estado', { ids: [r.id], estado: 'aprobada' }, { preserveScroll: true })}>Aprobar</Menu.Item>
                                                                    <Menu.Item leftSection={<IconX size={14} />} color="red" onClick={() => router.patch('/reservaciones/estado', { ids: [r.id], estado: 'rechazada' }, { preserveScroll: true })}>Rechazar</Menu.Item>
                                                                    <Menu.Divider />
                                                                    <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={() => actions.handleDeleteRes(r)}>Eliminar</Menu.Item>
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

                        {actions.selection.length > 0 && (
                            <Card withBorder radius="md" padding="sm" bg="var(--mantine-color-blue-0)">
                                <Group gap="sm" justify="space-between" wrap="wrap">
                                    <Text size="sm" fw={500}>{actions.selection.length} reservaciones seleccionadas</Text>
                                    <Group gap="sm">
                                        <Button size="xs" color="green" leftSection={<IconCheck size={14} />} onClick={actions.handleApproveSelected}>Aprobar</Button>
                                        <Button size="xs" color="red" leftSection={<IconX size={14} />} onClick={actions.handleRejectSelected}>Rechazar</Button>
                                        <Button size="xs" color="red" variant="outline" leftSection={<IconTrash size={14} />} onClick={actions.handleDeleteManyRes}>Eliminar</Button>
                                        <Button size="xs" variant="subtle" onClick={() => actions.setSelection([])}>Cancelar</Button>
                                    </Group>
                                </Group>
                            </Card>
                        )}
                    </Stack>
                )}

                {filters.activeTab === 'areas' && (
                    <Stack gap="md">
                        <Card withBorder radius="md" padding="md">
                            <TextInput placeholder="Buscar área por nombre o descripción…" leftSection={<IconBuilding size={16} />} value={filters.searchArea} onChange={(e) => filters.setSearchArea(e.currentTarget.value)} rightSection={filters.searchArea ? <ActionIcon size="xs" variant="subtle" onClick={() => filters.setSearchArea('')}><IconX size={12} /></ActionIcon> : null} />
                        </Card>

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
                                        {filters.filteredAreas.length === 0 ? (
                                            <Table.Tr>
                                                <Table.Td colSpan={8} ta="center" py="xl">
                                                    <Flex direction="column" align="center" gap="xs">
                                                        <IconAlertCircle size={32} color="gray" />
                                                        <Text c="dimmed">No se encontraron áreas comunes.</Text>
                                                    </Flex>
                                                </Table.Td>
                                            </Table.Tr>
                                        ) : (
                                            filters.filteredAreas.map((a) => (
                                                <Table.Tr key={a.id}>
                                                    <Table.Td><Text fw={600} size="sm">{a.nombre}</Text></Table.Td>
                                                    <Table.Td><Text size="sm" lineClamp={2} c="dimmed">{a.descripcion ?? '—'}</Text></Table.Td>
                                                    <Table.Td><Group gap={4}><IconUsers size={14} /><Text size="sm">{a.capacidad ?? '—'}</Text></Group></Table.Td>
                                                    <Table.Td><Text size="sm">{a.horaApertura} – {a.horaCierre}</Text></Table.Td>
                                                    <Table.Td><Center><Badge color={a.reservable ? 'green' : 'gray'} variant="light">{a.reservable ? 'Sí' : 'No'}</Badge></Center></Table.Td>
                                                    <Table.Td><Center>{a.requiereAprobacion ? <Badge color="orange" variant="light" leftSection={<IconLock size={12} />}>Sí</Badge> : <Badge color="gray" variant="light">No</Badge>}</Center></Table.Td>
                                                    <Table.Td><Text size="sm" ta="center">{a.reservacionesCount}</Text></Table.Td>
                                                    <Table.Td>
                                                        <Group gap="xs" justify="center">
                                                            <ActionIcon variant="subtle" color="yellow" onClick={() => actions.handleOpenEditArea(a)} title="Editar"><IconPencil size={16} /></ActionIcon>
                                                            <ActionIcon variant="subtle" color="red" onClick={() => actions.handleDeleteArea(a)} title="Eliminar"><IconTrash size={16} /></ActionIcon>
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

            <Modal opened={actions.resModalOpened} onClose={actions.closeResModal} title={<Group gap="xs"><ThemeIcon color={actions.editingResId === null ? 'blue' : 'yellow'} variant="light" size="md">{actions.editingResId === null ? <IconPlus size={16} /> : <IconPencil size={16} />}</ThemeIcon><Text fw={600}>{actions.editingResId === null ? 'Nueva Reservación' : 'Editar Reservación'}</Text></Group>} size="lg" radius="md">
                <Stack gap="md">
                    <Grid gap="md">
                        <Grid.Col span={{ base: 12, sm: 6 }}><Select label="Área común" required searchable data={areaOptions} value={actions.resForm.data.areaComunId ? String(actions.resForm.data.areaComunId) : null} error={actions.resForm.errors.areaComunId} onChange={(val) => actions.resForm.setData('areaComunId', val ? Number(val) : '')} /></Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}><Select label="Usuario" required searchable data={usuarioOptions} value={actions.resForm.data.usuarioId ? String(actions.resForm.data.usuarioId) : null} error={actions.resForm.errors.usuarioId} onChange={(val) => actions.resForm.setData('usuarioId', val ? Number(val) : '')} /></Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 4 }}><TextInput label="Fecha" type="date" required value={actions.resForm.data.fecha} error={actions.resForm.errors.fecha} onChange={(e) => actions.resForm.setData('fecha', e.currentTarget.value)} /></Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 4 }}><TextInput label="Hora inicio" type="time" required value={actions.resForm.data.horaInicio} error={actions.resForm.errors.horaInicio} onChange={(e) => actions.resForm.setData('horaInicio', e.currentTarget.value)} /></Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 4 }}><TextInput label="Hora fin" type="time" required value={actions.resForm.data.horaFin} error={actions.resForm.errors.horaFin} onChange={(e) => actions.resForm.setData('horaFin', e.currentTarget.value)} /></Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}><NumberInput label="Núm. asistentes" min={1} value={actions.resForm.data.numAsistentes} error={actions.resForm.errors.numAsistentes} onChange={(val) => actions.resForm.setData('numAsistentes', val)} /></Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}><Select label="Estado" required data={filters.estadoOptions} value={actions.resForm.data.estado} error={actions.resForm.errors.estado} onChange={(val) => actions.resForm.setData('estado', (val as ReservacionData['estado']) ?? 'pendiente')} /></Grid.Col>
                        <Grid.Col span={12}><TextInput label="Motivo" placeholder="Descripción breve del evento" value={actions.resForm.data.motivo} error={actions.resForm.errors.motivo} onChange={(e) => actions.resForm.setData('motivo', e.currentTarget.value)} /></Grid.Col>
                        {actions.resForm.data.estado === 'rechazada' && <Grid.Col span={12}><TextInput label="Motivo de rechazo" required value={actions.resForm.data.motivoRechazo} error={actions.resForm.errors.motivoRechazo} onChange={(e) => actions.resForm.setData('motivoRechazo', e.currentTarget.value)} /></Grid.Col>}
                    </Grid>
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={actions.closeResModal}>Cancelar</Button>
                        <Button color={actions.editingResId === null ? 'blue' : 'yellow'} onClick={actions.handleSubmitRes} loading={actions.resForm.processing}>{actions.editingResId === null ? 'Guardar' : 'Actualizar'}</Button>
                    </Group>
                </Stack>
            </Modal>

            <Modal opened={actions.areaModalOpened} onClose={actions.closeAreaModal} title={<Group gap="xs"><ThemeIcon color={actions.editingAreaId === null ? 'blue' : 'yellow'} variant="light" size="md">{actions.editingAreaId === null ? <IconPlus size={16} /> : <IconPencil size={16} />}</ThemeIcon><Text fw={600}>{actions.editingAreaId === null ? 'Nueva Área Común' : 'Editar Área Común'}</Text></Group>} size="lg" radius="md">
                <Stack gap="md">
                    <Grid gap="md">
                        <Grid.Col span={{ base: 12, sm: 8 }}><TextInput label="Nombre" required placeholder="Ej: Terraza, Salón de usos múltiples" value={actions.areaForm.data.nombre} error={actions.areaForm.errors.nombre} onChange={(e) => actions.areaForm.setData('nombre', e.currentTarget.value)} /></Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 4 }}><NumberInput label="Capacidad (personas)" min={1} value={actions.areaForm.data.capacidad} error={actions.areaForm.errors.capacidad} onChange={(val) => actions.areaForm.setData('capacidad', val)} /></Grid.Col>
                        <Grid.Col span={12}><TextInput label="Descripción" placeholder="Descripción breve del espacio" value={actions.areaForm.data.descripcion} error={actions.areaForm.errors.descripcion} onChange={(e) => actions.areaForm.setData('descripcion', e.currentTarget.value)} /></Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}><TextInput label="Hora apertura" type="time" required value={actions.areaForm.data.horaApertura} error={actions.areaForm.errors.horaApertura} onChange={(e) => actions.areaForm.setData('horaApertura', e.currentTarget.value)} /></Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}><TextInput label="Hora cierre" type="time" required value={actions.areaForm.data.horaCierre} error={actions.areaForm.errors.horaCierre} onChange={(e) => actions.areaForm.setData('horaCierre', e.currentTarget.value)} /></Grid.Col>
                        <Grid.Col span={12}><Textarea label="Reglas de uso" placeholder="Normas y restricciones del espacio…" minRows={3} value={actions.areaForm.data.reglas} error={actions.areaForm.errors.reglas} onChange={(e) => actions.areaForm.setData('reglas', e.currentTarget.value)} /></Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}><Switch label="Reservable" description="Permite que los residentes soliciten reservaciones." checked={actions.areaForm.data.reservable} onChange={(e) => actions.areaForm.setData('reservable', e.currentTarget.checked)} /></Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}><Switch label="Requiere aprobación" description="El administrador debe aprobar cada solicitud." checked={actions.areaForm.data.requiereAprobacion} onChange={(e) => actions.areaForm.setData('requiereAprobacion', e.currentTarget.checked)} /></Grid.Col>
                    </Grid>
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={actions.closeAreaModal}>Cancelar</Button>
                        <Button color={actions.editingAreaId === null ? 'blue' : 'yellow'} onClick={actions.handleSubmitArea} loading={actions.areaForm.processing}>{actions.editingAreaId === null ? 'Guardar Área' : 'Actualizar Área'}</Button>
                    </Group>
                </Stack>
            </Modal>

            <Drawer opened={actions.detailDrawerOpened} onClose={actions.closeDetailDrawer} title={actions.selectedRes ? <Text fw={700} size="md">{actions.selectedRes.areaComunNombre}</Text> : null} position="right" size="md" overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}>
                {actions.selectedRes && (
                    <Stack gap="lg" mt="md">
                        <Card withBorder radius="md" p="md">
                            <Group justify="space-between">
                                <Text size="xs" tt="uppercase" fw={700} c="dimmed">Estado</Text>
                                {getEstadoBadge(actions.selectedRes.estado)}
                            </Group>
                            {actions.selectedRes.motivoRechazo && <Text size="xs" c="red" mt="xs">Motivo de rechazo: {actions.selectedRes.motivoRechazo}</Text>}
                        </Card>
                        <Card withBorder radius="md" p="md">
                            <Stack gap="xs">
                                <Flex align="center" gap="xs"><IconCalendar size={18} color="var(--mantine-color-blue-6)" /><Box><Text size="xs" c="dimmed">Fecha</Text><Text size="sm" fw={500}>{actions.selectedRes.fecha}</Text></Box></Flex>
                                <Flex align="center" gap="xs"><IconClock size={18} color="var(--mantine-color-blue-6)" /><Box><Text size="xs" c="dimmed">Horario</Text><Text size="sm" fw={500}>{actions.selectedRes.horaInicio} – {actions.selectedRes.horaFin}</Text></Box></Flex>
                                <Flex align="center" gap="xs"><IconUsers size={18} color="var(--mantine-color-blue-6)" /><Box><Text size="xs" c="dimmed">Asistentes</Text><Text size="sm" fw={500}>{actions.selectedRes.numAsistentes ?? '—'}</Text></Box></Flex>
                            </Stack>
                        </Card>
                        <Card withBorder radius="md" p="md">
                            <Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="xs">Solicitante</Text>
                            <Text size="sm" fw={600}>{actions.selectedRes.usuarioNombre}</Text>
                            <Text size="xs" c="dimmed">{actions.selectedRes.usuarioEmail}</Text>
                        </Card>
                        {actions.selectedRes.motivo && <Card withBorder radius="md" p="md"><Text size="xs" tt="uppercase" fw={700} c="dimmed" mb="xs">Motivo</Text><Text size="sm">{actions.selectedRes.motivo}</Text></Card>}
                        <Group justify="flex-end" mt="md">
                            <Button variant="outline" color="yellow" leftSection={<IconPencil size={16} />} onClick={() => { actions.closeDetailDrawer(); actions.handleOpenEditRes(actions.selectedRes!); }}>Editar Reservación</Button>
                        </Group>
                    </Stack>
                )}
            </Drawer>
        </>
    );
}
