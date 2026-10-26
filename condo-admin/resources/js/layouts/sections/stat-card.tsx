import type { ReactNode } from 'react';
import { Box, Card, Group, SimpleGrid, Text, ThemeIcon, Title } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';

export interface StatCardProps {
    label: string;
    value: ReactNode;
    caption?: string;
    color?: string;
    icon?: Icon;
    visual?: ReactNode;
}

export function StatCard({ label, value, caption, color = 'blue', icon: IconComponent, visual }: StatCardProps) {
    return (
        <Card withBorder radius="md" padding="md">
            <Group justify="space-between" align="center">
                <Box>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>{label}</Text>
                    <Title order={3} fw={700} mt={4} c={color}>{value}</Title>
                    {caption && <Text size="xs" c="dimmed" mt={2}>{caption}</Text>}
                </Box>
                {visual ?? (IconComponent && (
                    <ThemeIcon color={color} variant="light" size="xl" radius="md">
                        <IconComponent size={24} />
                    </ThemeIcon>
                ))}
            </Group>
        </Card>
    );
}

export function StatsGrid({ stats }: { stats: StatCardProps[] }) {
    return (
        <SimpleGrid cols={{ base: 1, sm: 2, md: Math.min(stats.length, 4) }} spacing="md">
            {stats.map((s) => <StatCard key={s.label} {...s} />)}
        </SimpleGrid>
    );
}
