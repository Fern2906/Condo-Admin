import { Burger, Container, Divider, Drawer, ScrollArea, Group, FloatingIndicator } from '@mantine/core';
import { Link } from '@inertiajs/react';
import { useDisclosure } from '@mantine/hooks';
import { useState } from 'react';

import classes from '../../css/navbar.module.css';

interface NavbarLink {
    label: string;
    link: string;
}

interface NavbarProps {
    links: NavbarLink[];
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
        <header className={classes.header}>
            <Container size="md" className={classes.inner}>
                <Link href="/" aria-label="Inicio">
                    <span>CONDO ADMIN</span>
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
