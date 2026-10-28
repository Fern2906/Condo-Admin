import type { LocalData, LocalForm } from '@/types/locales.types';

export const ESTADOS: LocalData['status'][] = ['Disponible', 'Ocupado', 'Mantenimiento', 'Reservado'];

export const GIROS = [
    'Comercial / Retail',
    'Gastronómico',
    'Salud y Farmacia',
    'Servicios y Belleza',
    'Oficina / Coworking',
    'Conveniencia',
];

export const EDIFICIOS = ['Torre A', 'Torre B', 'Torre C', 'Plaza Central'];

export const NIVELES = ['Planta Baja', 'Piso 1', 'Piso 2', 'Nivel Terraza'];

export const EMPTY_LOCAL: LocalForm = {
    code: '',
    name: '',
    businessType: 'Comercial / Retail',
    building: 'Torre A',
    level: 'Planta Baja',
    area: 60,
    monthlyRent: 15000,
    maintenanceFee: 2000,
    status: 'Disponible',
    tenantName: '',
    tenantMail: '',
    tenantPhone: '',
    contractEnd: '',
};

export const toLocalForm = (local: LocalData): LocalForm => ({
    code: local.code,
    name: local.name,
    businessType: local.businessType,
    building: local.building,
    level: local.level,
    area: local.area,
    monthlyRent: local.monthlyRent,
    maintenanceFee: local.maintenanceFee,
    status: local.status,
    tenantName: local.tenantName ?? '',
    tenantMail: local.tenantMail ?? '',
    tenantPhone: local.tenantPhone ?? '',
    contractEnd: local.contractEnd ?? '',
});

export const withValue = (options: string[], value: string) =>
    value && !options.includes(value) ? [value, ...options] : options;

export const getStatusColor = (status: LocalData['status']) => {
    switch (status) {
        case 'Ocupado':
            return 'green';
        case 'Disponible':
            return 'blue';
        case 'Mantenimiento':
            return 'orange';
        case 'Reservado':
            return 'grape';
    }
};
