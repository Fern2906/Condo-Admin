import { Button, Container, Overlay, Title, Text } from "@mantine/core";
import classes from '../../css/welcome.module.css';
import { login } from "@/routes";

export default function Welcome() {
    return (
        <div className={classes.hero}>
            <Overlay
                gradient="linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, .65) 40%)"
                opacity={1}
                zIndex={0}
            />
            <Container className={classes.container} size="md">
                <Title className={classes.title}>
                    Gestión inteligente para tu comunidad y edificio
                </Title>
                <Text className={classes.description} size="xl" mt="xl">
                    Simplifica la administración de tu condominio. Controla pagos de mantenimiento,
                    reserva de áreas comunes, accesos y comunicación directa entre residentes y la
                    administración en un solo lugar.
                </Text>

                <Button component="a" href={login.url()} variant="gradient" size="xl" radius="xl" className={classes.control}>
                    Comienza
                </Button>
            </Container>
        </div>
    );
}
