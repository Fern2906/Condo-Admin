import type { ReactNode } from 'react';
import { Button, Group, Modal, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconPencil, IconPlus } from '@tabler/icons-react';

interface FormModalProps {
    opened: boolean;
    onClose: () => void;
    title: string;
    /** Cambia el icono y el color (azul = alta, amarillo = edición). */
    isEdit?: boolean;
    submitLabel: string;
    onSubmit: () => void;
    loading?: boolean;
    size?: string;
    children: ReactNode;
}

export function FormModal({ opened, onClose, title, isEdit = false, submitLabel, onSubmit, loading, size = 'lg', children }: FormModalProps) {
    const color = isEdit ? 'yellow' : 'blue';
    return (
        <Modal
            opened={opened}
            onClose={onClose}
            size={size}
            radius="md"
            title={
                <Group gap="xs">
                    <ThemeIcon color={color} variant="light" size="md">
                        {isEdit ? <IconPencil size={16} /> : <IconPlus size={16} />}
                    </ThemeIcon>
                    <Text fw={600}>{title}</Text>
                </Group>
            }
        >
            <Stack gap="md">
                {children}
                <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={onClose}>Cancelar</Button>
                    <Button color={color} onClick={onSubmit} loading={loading}>{submitLabel}</Button>
                </Group>
            </Stack>
        </Modal>
    );
}
