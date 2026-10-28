export interface LocalData {
    id: number;
    code: string;
    name: string;
    businessType: string;
    building: string;
    level: string;
    area: number;
    monthlyRent: number;
    maintenanceFee: number;
    status: 'Ocupado' | 'Disponible' | 'Mantenimiento' | 'Reservado';
    tenantName: string | null;
    tenantMail: string | null;
    tenantPhone: string | null;
    contractEnd: string | null;
}

export type LocalStatus = LocalData['status'];

export type LocalForm = {
    code: string;
    name: string;
    businessType: string;
    building: string;
    level: string;
    area: number | string;
    monthlyRent: number | string;
    maintenanceFee: number | string;
    status: LocalStatus;
    tenantName: string;
    tenantMail: string;
    tenantPhone: string;
    contractEnd: string;
};
