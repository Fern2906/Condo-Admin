import { Box, Center, Flex, Title, Text } from "@mantine/core";
import { JSX } from "react";

interface TittlePageProps {
    title: string;
    message: string;
    icon: React.ReactNode;
}

export function TittlePage({ title, message, icon }: TittlePageProps) {
    return (
        <Flex gap="md" align="center">
            <Center>
                {icon}
            </Center>
            <Box>
                <Title order={2} fw={600}>
                    {title}
                </Title>
                <Text c="dimmed" size="sm" mt={4}>
                    {message}
                </Text>
            </Box>
        </Flex>
    );
}
