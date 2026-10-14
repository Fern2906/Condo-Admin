import { Head, router } from '@inertiajs/react';
import { useForm } from '@mantine/form';
import {
    Anchor,
    Box,
    Button,
    Divider,
    Group,
    Paper,
    PasswordInput,
    Progress,
    Stack,
    Stepper,
    Text,
    TextInput,
    Title,
} from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import { login } from '@/routes';

type Props = {
    passwordRules?: string;
};

type RegisterValues = {
    name: string;
    email: string;
    telefono: string;
    telefono_alterno: string;
    contacto_emergencia: string;
    telefono_emergencia: string;
    password: string;
    password_confirmation: string;
};

function PasswordRequirement({
    meets,
    label,
}: {
    meets: boolean;
    label: string;
}) {
    return (
        <Text
            c={meets ? 'teal' : 'red'}
            style={{ display: 'flex', alignItems: 'center' }}
            mt={7}
            size="sm"
        >
            {meets ? <IconCheck size={14} /> : <IconX size={14} />}
            <Box ml={10}>{label}</Box>
        </Text>
    );
}

export default function Register(_props: Props) {
    const [active, setActive] = useState(0);
    const [processing, setProcessing] = useState(false);

    const form = useForm<RegisterValues>({
        mode: 'controlled',

        initialValues: {
            name: '',
            email: '',
            telefono: '',
            telefono_alterno: '',
            contacto_emergencia: '',
            telefono_emergencia: '',
            password: '',
            password_confirmation: '',
        },

        validate: {
            name: (value) => {
                const name = value.trim();

                if (!name) {
                    return 'El nombre es obligatorio';
                }

                if (name.length < 3) {
                    return 'El nombre debe tener al menos 3 caracteres';
                }

                if (name.length > 100) {
                    return 'El nombre no puede superar los 100 caracteres';
                }

                return null;
            },

            email: (value) => {
                const email = value.trim();

                if (!email) {
                    return 'El correo electrónico es obligatorio';
                }

                if (
                    email.length > 255 ||
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                ) {
                    return 'Ingresa un correo electrónico válido';
                }

                return null;
            },

            telefono: (value) => {
                if (!value) {
                    return 'El teléfono celular es obligatorio';
                }

                if (!/^\d{10}$/.test(value)) {
                    return 'El teléfono debe contener exactamente 10 dígitos';
                }

                return null;
            },

            telefono_alterno: (value) => {
                if (value && !/^\d{10}$/.test(value)) {
                    return 'El teléfono alterno debe contener 10 dígitos';
                }

                return null;
            },

            contacto_emergencia: (value) => {
                const name = value.trim();

                if (!name) {
                    return 'El contacto de emergencia es obligatorio';
                }

                if (name.length < 3) {
                    return 'Ingresa al menos 3 caracteres';
                }

                if (name.length > 100) {
                    return 'El nombre no puede superar los 100 caracteres';
                }

                return null;
            },

            telefono_emergencia: (value) => {
                if (!value) {
                    return 'El teléfono de emergencia es obligatorio';
                }

                if (!/^\d{10}$/.test(value)) {
                    return 'Debe contener exactamente 10 dígitos';
                }

                return null;
            },

            password: (value) => {
                if (!value) {
                    return 'La contraseña es obligatoria';
                }

                if (value.length < 8) {
                    return 'La contraseña debe tener al menos 8 caracteres';
                }

                if (value.length > 128) {
                    return 'La contraseña no puede superar los 128 caracteres';
                }

                if (!/[a-z]/.test(value)) {
                    return 'Incluye al menos una letra minúscula';
                }

                if (!/[A-Z]/.test(value)) {
                    return 'Incluye al menos una letra mayúscula';
                }

                if (!/\d/.test(value)) {
                    return 'Incluye al menos un número';
                }

                return null;
            },

            password_confirmation: (value, values) => {
                if (!value) {
                    return 'Debes confirmar tu contraseña';
                }

                if (value !== values.password) {
                    return 'Las contraseñas no coinciden';
                }

                return null;
            },
        },
    });

    // Calcula la seguridad de la contraseña.
    const password = form.values.password;

    const getPasswordStrength = (value: string) => {
        let strength = 0;

        if (value.length >= 8) strength += 25;
        if (value.length >= 12) strength += 25;

        if (/[a-z]/.test(value) && /[A-Z]/.test(value)) {
            strength += 25;
        }

        if (/\d/.test(value)) strength += 15;
        if (/[^a-zA-Z\d]/.test(value)) strength += 10;

        return strength;
    };

    const strength = getPasswordStrength(password);

    const strengthColor =
        strength >= 75 ? 'teal' : strength >= 40 ? 'yellow' : 'red';

    const stepFields: Record<number, (keyof RegisterValues)[]> = {
        0: ['name', 'email', 'password', 'password_confirmation'],
        1: [
            'telefono',
            'telefono_alterno',
            'contacto_emergencia',
            'telefono_emergencia',
        ],
    };

    const validateCurrentStep = () => {
        const fields = stepFields[active];

        if (!fields) return false;

        let hasErrors = false;

        fields.forEach((field) => {
            const result = form.validateField(field);

            if (result.hasError) {
                hasErrors = true;
            }
        });

        return !hasErrors;
    };

    const nextStep = () => {
        if (!validateCurrentStep()) return;

        setActive((current) => Math.min(current + 1, 1));
    };

    const prevStep = () => {
        setActive((current) => Math.max(current - 1, 0));
    };

    const handleSubmit = (values: RegisterValues) => {
        setProcessing(true);

        router.post('/register', values, {
            onError: (errors) => {
                form.setErrors(errors);

                // Si Laravel devuelve un error en las credenciales,
                // regresamos al primer paso.
                const firstStepFields = [
                    'name',
                    'email',
                    'password',
                    'password_confirmation',
                ];

                const hasFirstStepError = firstStepFields.some(
                    (field) => field in errors,
                );

                if (hasFirstStepError) {
                    setActive(0);
                }

                form.setFieldValue('password', '');
                form.setFieldValue('password_confirmation', '');
            },

            onFinish: () => {
                setProcessing(false);
            },
        });
    };

    const submitForm = form.onSubmit(handleSubmit);

    return (
        <>
            <Head title="Registro" />

            <Box maw={600} miw={500} mx="auto" px="md" py="xl">
                <Title ta="center" fw={500}>
                    Crear una cuenta
                </Title>

                <Text c="dimmed" size="sm" ta="center" mt={10}>
                    ¿Ya tienes una cuenta?{' '}
                    <Anchor size="sm" href={login.url()}>
                        Iniciar sesión
                    </Anchor>
                </Text>

                <Paper withBorder shadow="md" p={{ base: 20, sm: 30 }} mt={30} radius="md">
                    <form
                        onSubmit={(event) => {
                            if (active === 0) {
                                event.preventDefault();
                                nextStep();
                            } else {
                                submitForm(event);
                            }
                        }}
                    >
                        <Stepper
                            active={active}
                            allowNextStepsSelect={false}
                        >
                            <Stepper.Step
                                label="Paso 1"
                                description="Datos personales"
                            >
                                <Stack gap="md" mt="xl">
                                    <TextInput
                                        label="Nombre completo"
                                        placeholder="Tu nombre completo"
                                        autoComplete="name"
                                        required
                                        {...form.getInputProps('name')}
                                    />

                                    <TextInput
                                        label="Correo electrónico"
                                        placeholder="tu@ejemplo.com"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        {...form.getInputProps('email')}
                                    />

                                    <Divider label="Seguridad de la cuenta" />

                                    <PasswordInput
                                        label="Contraseña"
                                        placeholder="Crea una contraseña segura"
                                        autoComplete="new-password"
                                        required
                                        {...form.getInputProps('password')}
                                    />

                                    {password.length > 0 && (
                                        <Box>
                                            <Group gap={5} grow mb="xs">
                                                <Progress
                                                    value={strength}
                                                    color={strengthColor}
                                                    size="sm"
                                                />
                                            </Group>

                                            <Text size="sm" fw={500}>
                                                Seguridad de la contraseña
                                            </Text>

                                            <PasswordRequirement
                                                label="Al menos 8 caracteres"
                                                meets={password.length >= 8}
                                            />

                                            <PasswordRequirement
                                                label="Mayúsculas y minúsculas"
                                                meets={
                                                    /[a-z]/.test(password) &&
                                                    /[A-Z]/.test(password)
                                                }
                                            />

                                            <PasswordRequirement
                                                label="Al menos un número"
                                                meets={/\d/.test(password)}
                                            />

                                            <PasswordRequirement
                                                label="Al menos un símbolo (recomendado)"
                                                meets={/[^a-zA-Z\d]/.test(
                                                    password,
                                                )}
                                            />
                                        </Box>
                                    )}

                                    <PasswordInput
                                        label="Confirmar contraseña"
                                        placeholder="Repite tu contraseña"
                                        autoComplete="new-password"
                                        required
                                        {...form.getInputProps(
                                            'password_confirmation',
                                        )}
                                    />
                                </Stack>
                            </Stepper.Step>

                            {/* PASO 2: DATOS DE CONTACTO */}
                            <Stepper.Step
                                label="Paso 2"
                                description="Datos de contacto"
                            >
                                <Stack gap="md" mt="xl">
                                    <Text size="sm" c="dimmed">
                                        Ingresa tus teléfonos utilizando
                                        únicamente los 10 dígitos, sin espacios
                                        ni guiones.
                                    </Text>

                                    <TextInput
                                        label="Teléfono celular"
                                        placeholder="5551234567"
                                        type="tel"
                                        inputMode="numeric"
                                        maxLength={10}
                                        required
                                        {...form.getInputProps('telefono')}
                                        onChange={(event) => {
                                            form.setFieldValue(
                                                'telefono',
                                                event.currentTarget.value
                                                    .replace(/\D/g, '')
                                                    .slice(0, 10),
                                            );
                                        }}
                                    />

                                    <TextInput
                                        label="Teléfono alterno"
                                        placeholder="5551234567"
                                        type="tel"
                                        inputMode="numeric"
                                        maxLength={10}
                                        {...form.getInputProps(
                                            'telefono_alterno',
                                        )}
                                        onChange={(event) => {
                                            form.setFieldValue(
                                                'telefono_alterno',
                                                event.currentTarget.value
                                                    .replace(/\D/g, '')
                                                    .slice(0, 10),
                                            );
                                        }}
                                    />

                                    <Divider label="Contacto de emergencia" />

                                    <TextInput
                                        label="Nombre del contacto"
                                        placeholder="Nombre completo"
                                        autoComplete="off"
                                        required
                                        {...form.getInputProps(
                                            'contacto_emergencia',
                                        )}
                                    />

                                    <TextInput
                                        label="Teléfono de emergencia"
                                        placeholder="5551234567"
                                        type="tel"
                                        inputMode="numeric"
                                        maxLength={10}
                                        required
                                        {...form.getInputProps(
                                            'telefono_emergencia',
                                        )}
                                        onChange={(event) => {
                                            form.setFieldValue(
                                                'telefono_emergencia',
                                                event.currentTarget.value
                                                    .replace(/\D/g, '')
                                                    .slice(0, 10),
                                            );
                                        }}
                                    />
                                </Stack>
                            </Stepper.Step>
                        </Stepper>

                        <Group justify="space-between" mt="xl">
                            <Button
                                type="button"
                                variant="default"
                                onClick={prevStep}
                                disabled={active === 0 || processing}
                            >
                                Anterior
                            </Button>

                            {active === 0 ? (
                                <Button
                                    type="submit"
                                    disabled={processing}
                                >
                                    Siguiente
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    loading={processing}
                                >
                                    Crear cuenta
                                </Button>
                            )}
                        </Group>
                    </form>
                </Paper>
            </Box>
        </>
    );
}

Register.layout = {
    title: 'Crear una cuenta',
    description: 'Ingresa tus datos para crear tu cuenta',
};
