import { useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import type { DesgloseLocal } from '@/types/reportes.types';

export const useReportesActions = (locales: DesgloseLocal[]) => {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [detailOpened, { open: openDetail, close: closeDetail }] = useDisclosure(false);

    const selectedLocal = locales.find((l) => l.id === selectedId) ?? null;

    const handleViewDetail = (local: DesgloseLocal) => {
        setSelectedId(local.id);
        openDetail();
    };

    const handlePrint = () => {
        window.print();
    };

    return {
        selectedId,
        selectedLocal,
        detailOpened,
        closeDetail,
        handleViewDetail,
        handlePrint,
    };
};

