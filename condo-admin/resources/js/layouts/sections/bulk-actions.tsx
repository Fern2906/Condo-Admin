import { ActionBar, Box, Button, Menu, Text } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';

export interface BulkActionMenuItem {
    label: string;
    onClick: () => void;
    icon?: Icon;
    disabled?: boolean;
}

export interface BulkAction {
    label: string;
    icon?: Icon;
    color?: string;
    onClick?: () => void;
    disabled?: boolean;
    menu?: BulkActionMenuItem[];
}

interface BulkActionsProps {
    count: number;
    onClear: () => void;
    actions: BulkAction[];
    itemName?: string;
    children?: React.ReactNode;
}

export function BulkActions({ count, onClear, actions, itemName = 'seleccionados', children }: BulkActionsProps) {
    return (
        <ActionBar opened={count > 0} onClose={onClear} shadow="md">
            <Text visibleFrom="xs" size="sm">{count} {itemName}</Text>
            <ActionBar.Divider />
            {actions.map(({ label, icon: IconComponent, color = 'blue', onClick, disabled, menu }) => {
                if (menu && menu.length > 0) {
                    return (
                        <Menu key={label} shadow="md" position="top">
                            <Menu.Target>
                                <Button
                                    variant="filled"
                                    color={color}
                                    px={{ base: 'xs', sm: 'md' }}
                                    disabled={disabled}
                                >
                                    {IconComponent && <IconComponent size={14} />}
                                    <Box visibleFrom="xs" ml={IconComponent ? 6 : 0}>{label}</Box>
                                </Button>
                            </Menu.Target>
                            <Menu.Dropdown>
                                {menu.map((item) => {
                                    const ItemIcon = item.icon;
                                    return (
                                        <Menu.Item
                                            key={item.label}
                                            onClick={item.onClick}
                                            disabled={item.disabled}
                                            leftSection={ItemIcon ? <ItemIcon size={14} /> : undefined}
                                        >
                                            {item.label}
                                        </Menu.Item>
                                    );
                                })}
                            </Menu.Dropdown>
                        </Menu>
                    );
                }

                return (
                    <Button
                        key={label}
                        variant="filled"
                        color={color}
                        px={{ base: 'xs', sm: 'md' }}
                        disabled={disabled}
                        onClick={onClick}
                    >
                        {IconComponent && <IconComponent size={14} />}
                        <Box visibleFrom="xs" ml={IconComponent ? 6 : 0}>{label}</Box>
                    </Button>
                );
            })}
            {children}
            <ActionBar.CloseButton />
        </ActionBar>
    );
}
