export interface UserLocal {
    id: number;
    code: string;
    name: string;
    building: string;
    level: string;
    status: string;
}

export interface UserData {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    altPhone: string | null;
    rfc: string | null;
    emergencyContact: string | null;
    emergencyPhone: string | null;
    active: boolean;
    verified: boolean;
    local: UserLocal | null;
    localesCount: number;
}

export interface UserForm {
    name: string;
    email: string;
    phone: string;
    altPhone: string;
    rfc: string;
    emergencyContact: string;
    emergencyPhone: string;
    active: boolean;
}
