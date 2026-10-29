import { Burger, Container, Divider, Drawer, ScrollArea, Group, FloatingIndicator, Title, useMantineTheme, Text } from '@mantine/core';
import { Link } from '@inertiajs/react';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';
import { Building2Icon } from 'lucide-react';
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
    const [opened, { toggle, close }] = useDisclosure(false);
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
        <header className={classes.header} style={{ zIndex: 1000001 }}>
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
                </ScrollArea>
            </Drawer>
        </header>
    );
}
