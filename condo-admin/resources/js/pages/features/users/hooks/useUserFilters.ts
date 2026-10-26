import { useMemo, useState } from 'react';
import type { UserData } from '@/types/users.types';

export const useUserFilters = (users: UserData[]) => {
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<string[]>([]);
    const [building, setBuilding] = useState<string[]>([]);

    const buildingData = useMemo(
        () =>
            [...new Set(users.flatMap((u) => (u.local ? [u.local.building] : [])))]
                .sort()
                .map((b) => ({ value: b, label: b })),
        [users]
    );

    const filteredUsers = useMemo(() => {
        const query = search.toLowerCase();

        return users.filter((user) => {
            const matchesSearch =
                query === '' ||
                user.name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query) ||
                (user.local?.code.toLowerCase().includes(query) ?? false) ||
                (user.local?.building.toLowerCase().includes(query) ?? false);

            const matchesStatus = status.length === 0 || status.includes(user.active ? 'activo' : 'inactivo');
            const matchesBuilding = building.length === 0 || (user.local !== null && building.includes(user.local.building));

            return matchesSearch && matchesStatus && matchesBuilding;
        });
    }, [users, search, status, building]);

    return {
        search,
        setSearch,
        status,
        setStatus,
        building,
        setBuilding,
        buildingData,
        filteredUsers,
    };
};
