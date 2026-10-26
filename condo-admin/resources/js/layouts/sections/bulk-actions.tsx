import { ActionBar, Box, Button, Text } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';

export interface BulkAction {
    label: string;
    icon: Icon;
    color?: string;
    onClick: () => void;
    disabled?: boolean;
}

interface BulkActionsProps {
    count: number;
    onClear: () => void;
    actions: BulkAction[];
    itemName?: string;
}

export function BulkActions({ count, onClear, actions, itemName = 'seleccionados' }: BulkActionsProps) {
    return (
        <ActionBar opened={count > 0} onClose={onClear} shadow="md">
            <Text visibleFrom="xs" size="sm">{count} {itemName}</Text>
            <ActionBar.Divider />
            {actions.map(({ label, icon: IconComponent, color = 'blue', onClick, disabled }) => (
                <Button key={label} variant="filled" color={color} px={{ base: 'xs', sm: 'md' }} disabled={disabled} onClick={onClick}>
                    <IconComponent size={14} />
                    <Box visibleFrom="xs" ml={6}>{label}</Box>
                </Button>
            ))}
            <ActionBar.CloseButton />
        </ActionBar>
    );
}
