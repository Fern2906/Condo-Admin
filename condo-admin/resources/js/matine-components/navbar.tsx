import { Avatar, Burger, Button, Container, Divider, Drawer, ScrollArea, Group, FloatingIndicator, Menu, Stack, UnstyledButton, useMantineTheme, Text } from '@mantine/core';
import { Link, router, usePage } from '@inertiajs/react';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { Building2Icon } from 'lucide-react';
import { IconChevronDown, IconLogout, IconSettings } from '@tabler/icons-react';
import { useInitials } from '@/hooks/use-initials';
import { logout } from '@/routes';
import { edit } from '@/routes/profile';
import classes from '../../css/navbar.module.css';

interface NavbarLink {
    label: string;
    link: string;
}

interface NavbarProps {
    links: NavbarLink[];
}

interface LogoProps {
    width?: number;
    height?: number;
}

function CondoAdminLogo({ width = 28, height = 28 }: Readonly<LogoProps>) {
    const theme = useMantineTheme();

    return (
        <svg
            width={width}
            height={height}
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <Building2Icon width={width} height={height} color={theme.colors.blue[6]} />
        </svg>
    );
}
export default function Navbar({ links }: Readonly<NavbarProps>) {
    const { auth } = usePage().props;
    const getInitials = useInitials();
    const [opened, { toggle, close }] = useDisclosure(false);

    const handleLogout = () => {
        close();
        router.flushAll();
        router.post(logout.url());
    };
    const [active, setActive] = useState(links[0]?.link ?? '');

    const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);
    const [controlsRefs, setControlsRefs] = useState<Record<string, HTMLAnchorElement | null>>({});

    const setControlRef = (link: string) => (node: HTMLAnchorElement | null) => {
        setControlsRefs((prev) => ({ ...prev, [link]: node }));
    };

    const items = links.map((item) => (
        <Link
            key={item.label}
            href={item.link}
            ref={setControlRef(item.link)}
            className={classes.link}
            data-active={active === item.link || undefined}
            onClick={() => {
                setActive(item.link);
                close();
            }}
        >
            {item.label}
        </Link>
    ));

    return (
        <header className={classes.header} style={{ zIndex: 10 }}>
            <Container size="md" className={classes.inner}>
                <Link href="/" aria-label="Inicio" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Group gap={10} align="center">
                        <CondoAdminLogo width={30} height={30} />
                        <Text fw={800} size="lg" style={{ letterSpacing: '-0.3px' }}>
                            CONDO ADMIN
                        </Text>
                    </Group>
                </Link>

                <Group gap={5} visibleFrom="xs" ref={setRootRef} style={{ position: 'relative' }}>
                    {items}
                    <FloatingIndicator
                        target={controlsRefs[active]}
                        parent={rootRef}
                        className={classes.indicator}
                    />
                </Group>

                {auth.user && (
                    <Menu position="bottom-end" shadow="md" width={220}>
                        <Menu.Target>
                            <UnstyledButton visibleFrom="xs" aria-label="Menú de usuario">
                                <Group gap={8} wrap="nowrap">
                                    <Avatar src={auth.user.avatar} color="blue" radius="xl" size={30}>
                                        {getInitials(auth.user.name)}
                                    </Avatar>
                                    <Text size="sm" fw={600} maw={140} truncate>
                                        {auth.user.name}
                                    </Text>
                                    <IconChevronDown size={14} />
                                </Group>
                            </UnstyledButton>
                        </Menu.Target>
                        <Menu.Dropdown>
                            <Menu.Label>{auth.user.email}</Menu.Label>
                            <Menu.Item component={Link} href={edit.url()} leftSection={<IconSettings size={14} />}>
                                Configuración
                            </Menu.Item>
                            <Menu.Divider />
                            <Menu.Item
                                color="red"
                                leftSection={<IconLogout size={14} />}
                                onClick={handleLogout}
                                data-test="logout-button"
                            >
                                Cerrar sesión
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                )}

                <Burger
                    opened={opened}
                    onClick={toggle}
                    hiddenFrom="xs"
                    size="sm"
                    aria-label="Abrir navegación"
                />
            </Container>

            <Drawer
                opened={opened}
                onClose={close}
                size="100%"
                padding="md"
                title="Navegación"
                hiddenFrom="xs"
                zIndex={1000000}
            >
                <ScrollArea h="calc(100vh - 80px)" mx="-md">
                    <Divider my="sm" />
                    <Group gap="sm" p="md">
                        {items}
                    </Group>

                    {auth.user && (
                        <>
                            <Divider my="sm" />
                            <Stack gap="sm" p="md">
                                <Group gap={10} wrap="nowrap">
                                    <Avatar src={auth.user.avatar} color="blue" radius="xl">
                                        {getInitials(auth.user.name)}
                                    </Avatar>
                                    <div style={{ minWidth: 0 }}>
                                        <Text size="sm" fw={600} truncate>{auth.user.name}</Text>
                                        <Text size="xs" c="dimmed" truncate>{auth.user.email}</Text>
                                    </div>
                                </Group>
                                <Button
                                    component={Link}
                                    href={edit.url()}
                                    variant="light"
                                    leftSection={<IconSettings size={16} />}
                                    onClick={close}
                                >
                                    Configuración
                                </Button>
                                <Button
                                    color="red"
                                    variant="light"
                                    leftSection={<IconLogout size={16} />}
                                    onClick={handleLogout}
                                >
                                    Cerrar sesión
                                </Button>
                            </Stack>
                        </>
                    )}
                </ScrollArea>
            </Drawer>
        </header>
    );
}
