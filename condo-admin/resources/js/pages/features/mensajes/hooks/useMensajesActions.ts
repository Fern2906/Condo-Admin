import { useState } from 'react';
import type { MensajeData } from '@/types/mensajes.types';

export const useMensajesActions = (
    selectedContactoId: number | null,
    onMessageCreated?: (newMsg: MensajeData) => void
) => {
    const [inputText, setInputText] = useState('');
    const [selectedSolicitudId, setSelectedSolicitudId] = useState<number | null>(null);
    const [sending, setSending] = useState(false);

    const handleSendMessage = async () => {
        const text = inputText.trim();
        if (!text || !selectedContactoId || sending) return;

        setSending(true);

        try {
            const csrfToken =
                (document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement)?.content || '';

            const response = await fetch('/mensajes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken,
                },
                body: JSON.stringify({
                    receptorId: selectedContactoId,
                    solicitudId: selectedSolicitudId,
                    mensaje: text,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.mensaje && onMessageCreated) {
                    onMessageCreated(data.mensaje);
                }
                setInputText('');
            }
        } catch (error) {
            console.error('Error al enviar mensaje:', error);
        } finally {
            setSending(false);
        }
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

