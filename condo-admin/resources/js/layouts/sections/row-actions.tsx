import type { ReactNode } from 'react';
import { ActionIcon, Group, Menu } from '@mantine/core';
import { IconDotsVertical, IconEye, IconPencil, IconTrash } from '@tabler/icons-react';

interface RowActionsProps {
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    deleteDisabled?: boolean;
    /** <Menu.Item /> extra que se muestran entre "Editar" y "Eliminar". */
    menuItems?: ReactNode;
}

export function RowActions({ onView, onEdit, onDelete, deleteDisabled, menuItems }: RowActionsProps) {
    return (
        <Group gap="xs" justify="center" wrap="nowrap">
            {onView && (
                <ActionIcon variant="subtle" color="blue" title="Ver detalles" onClick={onView}>
                    <IconEye size={16} />
                </ActionIcon>
            )}
            {onEdit && (
                <ActionIcon variant="subtle" color="yellow" title="Editar" onClick={onEdit}>
                    <IconPencil size={16} />
                </ActionIcon>
            )}
            <Menu position="bottom-end" shadow="md">
                <Menu.Target>
                    <ActionIcon variant="subtle" color="gray"><IconDotsVertical size={16} /></ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                    {onView && <Menu.Item leftSection={<IconEye size={14} />} onClick={onView}>Ver detalles</Menu.Item>}
                    {onEdit && <Menu.Item leftSection={<IconPencil size={14} />} onClick={onEdit}>Editar</Menu.Item>}
                    {menuItems}
                    {onDelete && (
                        <>
                            <Menu.Divider />
                            <Menu.Item color="red" leftSection={<IconTrash size={14} />} disabled={deleteDisabled} onClick={onDelete}>
                                Eliminar
                            </Menu.Item>
                        </>
                    )}
                </Menu.Dropdown>
            </Menu>
        </Group>
    );
}
