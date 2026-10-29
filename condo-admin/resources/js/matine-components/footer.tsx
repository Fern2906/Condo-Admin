import { Building2Icon } from 'lucide-react';
import { Anchor, Container, Group, Text } from '@mantine/core';
import { Link } from '@inertiajs/react';
import classes from '../../css/footer.module.css';

interface FooterLink {
    label: string;
    link: string;
}

interface FooterProps {
    links?: FooterLink[];
}

const DEFAULT_LINKS: FooterLink[] = [
    { label: 'Inicio', link: '/' },
    { label: 'Contacto', link: '/contacto' },
    { label: 'Privacidad', link: '/privacidad' },
    { label: 'Términos', link: '/terminos' },
];

export function Footer({ links = DEFAULT_LINKS }: Readonly<FooterProps>) {
    const currentYear = new Date().getFullYear();

    const items = links.map((item) => (
        <Anchor
            component={Link}
            key={item.label}
            href={item.link}
            c="dimmed"
            size="sm"
            lh={1}
        >
            {item.label}
        </Anchor>
    ));

    return (
        <footer className={classes.footer}>
            <Container className={classes.inner}>
                <Group gap={8} align="center">
                    <Building2Icon size={22} color="var(--mantine-color-blue-6)" />
                    <Text fw={700} size="md">
                        CONDO ADMIN
                    </Text>
                </Group>

                <Group className={classes.links}>{items}</Group>
            </Container>

            <Container className={classes.bottom}>
                <Text c="dimmed" size="xs">
                    © {currentYear} CondoAdmin. Todos los derechos reservados.
                </Text>
            </Container>
        </footer>
    );
}
