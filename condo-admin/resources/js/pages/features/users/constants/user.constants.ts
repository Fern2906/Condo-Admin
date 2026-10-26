import type { UserData, UserForm } from '@/types/users.types';

export const EMPTY_USER_FORM: UserForm = {
    name: '',
    email: '',
    phone: '',
    altPhone: '',
    rfc: '',
    emergencyContact: '',
    emergencyPhone: '',
    active: true,
};

export const STATUS_OPTIONS = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
];

export const LOCAL_STATUS_COLOR: Record<string, string> = {
    Ocupado: 'green',
    Disponible: 'blue',
    Mantenimiento: 'orange',
    Reservado: 'grape',
};

export const toUserForm = (user: UserData): UserForm => ({
    name: user.name,
    email: user.email,
    phone: user.phone ?? '',
    altPhone: user.altPhone ?? '',
    rfc: user.rfc ?? '',
    emergencyContact: user.emergencyContact ?? '',
    emergencyPhone: user.emergencyPhone ?? '',
    active: user.active,
});
