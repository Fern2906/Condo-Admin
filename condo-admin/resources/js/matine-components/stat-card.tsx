import { Card, Title, RingProgress, ThemeIcon, Group, Box, Text, Center } from "@mantine/core";

interface StatItem {
    label: string;
    value: string;
    icon: React.ComponentType<{ size?: number; stroke?: number }>;
    color: string;
    progress?: number;
    description?: string;
}

export function StatCard({ stat }: { stat: StatItem }) {

    return (
        <Card withBorder radius="md" padding="lg" w={"100%"}>
            <Group justify="space-between" align="flex-start">
                <Box>
                    <Text size="xs" c="dimmed" tt="uppercase" fw={700} mb={4}>
                        {stat.label}
                    </Text>
                    <Title order={3} fw={700}>
                        {stat.value}
                    </Title>
                    <Text size="xs" c="dimmed" mt={4}>
                        {stat.description}
                    </Text>
                </Box>
                <RingProgress
                    size={80}
                    roundCaps
                    thickness={8}
                    sections={[{ value: stat.progress ?? 0, color: stat.color }]}
                    label={
                        <Center>
                            <ThemeIcon color={stat.color} variant="light" radius="xl" size="lg">
                                <stat.icon size={18} stroke={1.5} />
                            </ThemeIcon>
                        </Center>
                    }
                />
            </Group>
        </Card>
    );
}
