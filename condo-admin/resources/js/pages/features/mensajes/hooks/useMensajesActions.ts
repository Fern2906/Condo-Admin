import { useState } from 'react';
import { router } from '@inertiajs/react';

export const useMensajesActions = (selectedContactoId: number | null) => {
    const [inputText, setInputText] = useState('');
    const [selectedSolicitudId, setSelectedSolicitudId] = useState<number | null>(null);
    const [sending, setSending] = useState(false);

    const handleSendMessage = () => {
        const text = inputText.trim();
        if (!text || !selectedContactoId || sending) return;

        setSending(true);

        router.post(
            '/mensajes',
            {
                receptorId: selectedContactoId,
                solicitudId: selectedSolicitudId,
                mensaje: text,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setInputText('');
                    setSending(false);
                },
                onError: () => {
                    setSending(false);
                },
            }
        );
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return {
        inputText,
        setInputText,
        selectedSolicitudId,
        setSelectedSolicitudId,
        sending,
        handleSendMessage,
        handleKeyDown,
    };
};

