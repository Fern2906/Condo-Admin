import { UnstyledButton, Box, Badge, Text } from '@mantine/core';
import classes from '../../css/accion-cards.module.css';

interface ActionItem {
    title: string;
    icon: React.ComponentType<{ size?: number; stroke?: number; color?: string }>;
    color: string;
    badge?: string;
}

export function ActionButton({ item }: { item: ActionItem }) {
    return (
        <UnstyledButton className={classes.item}>
            <Box pos="relative" style={{ display: 'inline-block' }}>
                <item.icon size={32} stroke={1.5} color={`var(--mantine-color-${item.color}-6)`} />
                {item.badge && (
                    <Badge
                        size="xs"
                        color="red"
                        variant="filled"
                        pos="absolute"
                        top={-4}
                        right={-8}
                        style={{ minWidth: 16, padding: '0 4px' }}
                    >
                        {item.badge}
                    </Badge>
                )}
            </Box>
            <Text size="xs" mt={7} ta="center">
                {item.title}
            </Text>
        </UnstyledButton>
    );
}
