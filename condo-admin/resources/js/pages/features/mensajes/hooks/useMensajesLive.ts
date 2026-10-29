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
    const [selectedContactoId, setSelectedContactoId] = useState<number | null>(() => {
        return contactos.length > 0 ? contactos[0].id : null;
    });
    const [searchContacto, setSearchContacto] = useState('');
    const connectionStatus = useConnectionStatus();

    // Sincronizar si llegan props actualizados desde Inertia pero sin resetear selectedContactoId
    useEffect(() => {
        setMensajes((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newOnes = initialMensajes.filter((m) => !existingIds.has(m.id));
            if (newOnes.length === 0) return prev;
            return [...prev, ...newOnes];
        });
    }, [initialMensajes]);

    // Escucha en tiempo real por WebSockets (Canal público general de chat del condominio)
    // Escuchar tanto 'MensajeEnviado' como '.MensajeEnviado'
    useEchoPublic<{ mensaje: MensajeData }>(
        'chat.condominio',
        'MensajeEnviado',
        (payload) => {
            if (!payload?.mensaje) return;

            setMensajes((prev) => {
                if (prev.some((m) => m.id === payload.mensaje.id)) {
                    return prev;
                }
                return [...prev, payload.mensaje];
            });
        },
        []
    );

    useEchoPublic<{ mensaje: MensajeData }>(
        'chat.condominio',
        '.MensajeEnviado',
        (payload) => {
            if (!payload?.mensaje) return;

            setMensajes((prev) => {
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

    // Último mensaje por contacto
    const lastMessageByContact = useMemo(() => {
        const last: Record<number, MensajeData> = {};
        mensajes.forEach((m) => {
            const otherId = m.emisorId === currentUser.id ? m.receptorId : m.emisorId;
            if (otherId) {
                const current = last[otherId];
                if (!current || new Date(m.createdAt).getTime() > new Date(current.createdAt).getTime()) {
                    last[otherId] = m;
                }
            }
        });
        return last;
    }, [mensajes, currentUser.id]);

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

    // Filtro y ordenamiento de lista de contactos: los más recientes arriba
    const filteredContactos = useMemo(() => {
        const query = searchContacto.toLowerCase().trim();
        const filtered = contactos.filter(
            (c) =>
                query === '' ||
                c.name.toLowerCase().includes(query) ||
                c.email.toLowerCase().includes(query)
        );

        return [...filtered].sort((a, b) => {
            const lastMsgA = lastMessageByContact[a.id];
            const lastMsgB = lastMessageByContact[b.id];

            const timeA = lastMsgA ? new Date(lastMsgA.createdAt).getTime() : 0;
            const timeB = lastMsgB ? new Date(lastMsgB.createdAt).getTime() : 0;

            // Más reciente primero
            if (timeA !== timeB) {
                return timeB - timeA;
            }

            // Si ninguno tiene mensajes, ordenar alfabéticamente
            return a.name.localeCompare(b.name);
        });
    }, [contactos, searchContacto, lastMessageByContact]);

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

