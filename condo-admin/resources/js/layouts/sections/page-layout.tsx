import type { ReactNode } from 'react';
import { Flex, Stack } from '@mantine/core';
import type { Icon } from '@tabler/icons-react';
import { Head } from '@inertiajs/react';
import { TittlePage } from '@/matine-components/tittle-page';

interface PageLayoutProps {
    title: string;
    description: string;
    icon: Icon;
    headTitle?: string;
    actions?: ReactNode;
    children: ReactNode;
}

export function PageLayout({ title, description, icon: IconComponent, headTitle, actions, children }: PageLayoutProps) {
    return (
        <>
            <Head title={headTitle ?? title} />
            <Stack gap="xl" p="md" w="100%" h="100%">
                <Flex justify="space-between" align="center" wrap="wrap" gap="md">
                    <TittlePage
                        title={title}
                        message={description}
                        icon={<IconComponent size={40} color="var(--mantine-color-blue-8)" />}
                    />
                    {actions}
                </Flex>
                {children}
            </Stack>
        </>
    );
}
