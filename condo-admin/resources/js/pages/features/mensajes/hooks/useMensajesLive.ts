import { useEffect, useMemo, useState } from 'react';
import { useConnectionStatus, useEchoPublic } from '@laravel/echo-react';
import type { ContactoOption, CurrentUser, MensajeData, SolicitudOption } from '@/types/mensajes.types';

export const useMensajesLive = (
    initialMensajes: MensajeData[],
    contactos: ContactoOption[],
    solicitudes: SolicitudOption[],
    currentUser: CurrentUser
) => {
    const [mensajes, setMensajes] = useState<MensajeData[]>(initialMensajes);
    const [selectedContactoId, setSelectedContactoId] = useState<number | null>(
        contactos.length > 0 ? contactos[0].id : null
    );
    const [searchContacto, setSearchContacto] = useState('');
    const connectionStatus = useConnectionStatus();

    // Sincronizar si cambian los props iniciales
    useEffect(() => {
        setMensajes(initialMensajes);
    }, [initialMensajes]);

    // Escucha en tiempo real por WebSockets (Canal público general de chat del condominio)
    useEchoPublic<{ mensaje: MensajeData }>(
        'chat.condominio',
        'MensajeEnviado',
        (payload) => {
            if (!payload?.mensaje) return;

            setMensajes((prev) => {
                // Evitar duplicados
                if (prev.some((m) => m.id === payload.mensaje.id)) {
                    return prev;
                }
                return [...prev, payload.mensaje];
            });
        },
        []
    );

    // Contacto seleccionado actualmente
    const selectedContacto = useMemo(
        () => contactos.find((c) => c.id === selectedContactoId) ?? null,
        [contactos, selectedContactoId]
    );

    // Filtro de lista de contactos
    const filteredContactos = useMemo(() => {
        const query = searchContacto.toLowerCase().trim();
        return contactos.filter(
            (c) =>
                query === '' ||
                c.name.toLowerCase().includes(query) ||
                c.email.toLowerCase().includes(query)
        );
    }, [contactos, searchContacto]);

    // Mensajes de la conversación activa con el contacto seleccionado
    const conversationMensajes = useMemo(() => {
        if (!selectedContactoId) return [];

        return mensajes.filter(
            (m) =>
                (m.emisorId === currentUser.id && m.receptorId === selectedContactoId) ||
                (m.emisorId === selectedContactoId && (m.receptorId === currentUser.id || m.receptorId === null))
        );
    }, [mensajes, selectedContactoId, currentUser.id]);

    // Contador de no leídos por contacto
    const unreadCountByContact = useMemo(() => {
        const counts: Record<number, number> = {};
        mensajes.forEach((m) => {
            if (!m.leido && m.receptorId === currentUser.id) {
                counts[m.emisorId] = (counts[m.emisorId] || 0) + 1;
            }
        });
        return counts;
    }, [mensajes, currentUser.id]);

    // Último mensaje por contacto
    const lastMessageByContact = useMemo(() => {
        const last: Record<number, MensajeData> = {};
        mensajes.forEach((m) => {
            const otherId = m.emisorId === currentUser.id ? m.receptorId : m.emisorId;
            if (otherId) {
                last[otherId] = m;
            }
        });
        return last;
    }, [mensajes, currentUser.id]);

    return {
        mensajes,
        setMensajes,
        selectedContactoId,
        setSelectedContactoId,
        selectedContacto,
        searchContacto,
        setSearchContacto,
        filteredContactos,
        conversationMensajes,
        unreadCountByContact,
        lastMessageByContact,
        connectionStatus,
    };
};

