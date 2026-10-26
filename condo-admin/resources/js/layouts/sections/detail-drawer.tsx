import type { ReactNode } from 'react';
import { Box, Button, Card, Drawer, Flex, Group, Stack, Text } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';
import { IconPencil } from '@tabler/icons-react';

interface DetailDrawerProps {
    opened: boolean;
    onClose: () => void;
    title: ReactNode;
    /** Si se pasa, aparece el botón de editar al final (cierra el drawer y llama a onEdit). */
    onEdit?: () => void;
    editLabel?: string;
    children: ReactNode;
}

export function DetailDrawer({ opened, onClose, title, onEdit, editLabel = 'Editar', children }: DetailDrawerProps) {
    return (
        <Drawer
            opened={opened}
            onClose={onClose}
            title={<Text fw={700} size="md" component="div">{title}</Text>}
            position="right"
            size="md"
            overlayProps={{ backgroundOpacity: 0.5, blur: 4 }}
        >
            <Stack gap="lg" mt="md">
                {children}
                {onEdit && (
                    <Group justify="flex-end">
                        <Button
                            variant="outline"
                            color="yellow"
                            leftSection={<IconPencil size={16} />}
                            onClick={() => { onClose(); onEdit(); }}
                        >
                            {editLabel}
                        </Button>
                    </Group>
                )}
            </Stack>
        </Drawer>
    );
}

/** Bloque con título opcional. */
export function DetailSection({ title, children }: { title?: string; children: ReactNode }) {
    return (
        <Box>
            {title && <Text fw={700} size="sm" mb="xs">{title}</Text>}
            {children}
        </Box>
    );
}

/** Tarjeta "ESTADO": etiqueta a la izquierda y badges a la derecha. */
export function DetailStatus({ label = 'Estado', badges, children }: { label?: string; badges: ReactNode; children?: ReactNode }) {
    return (
        <Card withBorder radius="md" p="md">
            <Group justify="space-between">
                <Text size="xs" tt="uppercase" fw={700} c="dimmed">{label}</Text>
                <Group gap="xs">{badges}</Group>
            </Group>
            {children}
        </Card>
    );
}

export interface DetailItem {
    label: string;
    value: ReactNode;
    icon?: Icon;
}

/** Tarjeta con lista de pares etiqueta/valor (con icono opcional). */
export function DetailCard({ items }: { items: DetailItem[] }) {
    return (
        <Card withBorder radius="md" p="md">
            <Stack gap="xs">
                {items.map(({ label, value, icon: IconComponent }) => (
                    <Flex key={label} align="center" gap="xs">
                        {IconComponent && <IconComponent size={18} color="var(--mantine-color-blue-6)" />}
                        <Box>
                            <Text size="xs" c="dimmed">{label}</Text>
                            <Text size="sm" fw={500} component="div">{value ?? '—'}</Text>
                        </Box>
                    </Flex>
                ))}
            </Stack>
        </Card>
    );
}
