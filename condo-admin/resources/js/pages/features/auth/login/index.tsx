import { Head, router } from '@inertiajs/react';
import { useForm } from '@mantine/form';
import {
    Anchor,
    Box,
    Button,
    Checkbox,
    Divider,
    Paper,
    PasswordInput,
    Stack,
    Text,
    TextInput,
    Title,
} from '@mantine/core';
import { useState } from 'react';
import { register } from '@/routes';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

type LoginValues = {
    email: string;
    password: string;
    remember: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const [processing, setProcessing] = useState(false);

    const form = useForm<LoginValues>({
        mode: 'controlled',
        initialValues: {
            email: '',
            password: '',
            remember: false,
        },
        validate: {
            email: (value) => {
                const email = value.trim();
                if (!email) return 'El correo electrónico es obligatorio';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
                    return 'Ingresa un correo electrónico válido';
                return null;
            },
            password: (value) => {
                if (!value) return 'La contraseña es obligatoria';
                return null;
            },
        },
    });

    const handleSubmit = (values: LoginValues) => {
        setProcessing(true);

        router.post('/login', values, {
            onError: (errors) => {
                form.setErrors(errors);
                form.setFieldValue('password', '');
            },
            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    return (
        <>
            <Head title="Iniciar sesión" />

            <Box maw={600}  miw={500} mx="auto" px="md" py="xl">
                <Title ta="center" fw={500}>
                    Iniciar sesión
                </Title>

                <Text c="dimmed" size="sm" ta="center" mt={10}>
                    ¿No tienes una cuenta?{' '}
                    <Anchor size="sm" href={register.url()}>
                        Regístrate
                    </Anchor>
                </Text>

                <Paper withBorder shadow='md' p={{ base: 20, sm: 30 }} mt={30} radius={"md"}>
                    {status && (
                        <Text c="green" size="sm" ta="center" mb="md">
                            {status}
                        </Text>
                    )}

                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        <Stack>
                            <TextInput
                                label="Correo electrónico"
                                placeholder="tu@ejemplo.com"
                                type="email"
                                autoComplete="email"
                                autoFocus
                                required
                                {...form.getInputProps('email')}
                            />

                            <PasswordInput
                                label="Contraseña"
                                placeholder="Tu contraseña"
                                autoComplete="current-password"
                                required
                                {...form.getInputProps('password')}
                            />

                            <Stack gap="sm">
                                <Checkbox
                                    label="Recuérdame"
                                    {...form.getInputProps('remember', {
                                        type: 'checkbox',
                                    })}
                                />
                                <Divider />
                                {canResetPassword && (
                                    <Anchor
                                        size="sm"
                                        href="/forgot-password"
                                    >
                                        ¿Olvidaste tu contraseña?
                                    </Anchor>
                                )}
                            </Stack>

                        </Stack>

                        <Button
                            type="submit"
                            fullWidth
                            mt="xl"
                            loading={processing}
                        >
                            Iniciar sesión
                        </Button>
                    </form>
                </Paper>
            </Box>
        </>
    );
}

Login.layout = {
    title: 'Iniciar sesión',
    description: 'Ingresa tus credenciales para acceder a tu cuenta',
};
