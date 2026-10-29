import { useEffect, useRef, useState } from 'react';
import { ActionIcon, Avatar, Badge, Box, Button, Card, Center, Flex, Group, ScrollArea, Stack, Text, TextInput, ThemeIcon, Tooltip, } from '@mantine/core';
import { Head } from '@inertiajs/react';
import { IconArrowLeft, IconChecks, IconMessage, IconPaperclip, IconSearch, IconSend, IconUser, IconWifi, IconWifiOff,} from '@tabler/icons-react';

import { PageLayout } from '@/layouts/sections/page-layout';
import type { ContactoOption, CurrentUser, MensajeData, SolicitudOption } from '@/types/mensajes.types';
import { formatMessageTime } from './constants/mensajes.constants';
import { useMensajesLive } from './hooks/useMensajesLive';
import { useMensajesActions } from './hooks/useMensajesActions';

interface MensajesPageProps {
    mensajes: MensajeData[];
    contactos: ContactoOption[];
    solicitudes: SolicitudOption[];
    currentUser: CurrentUser;
}

export default function MensajesPage({
    mensajes: initialMensajes,
    contactos,
    solicitudes,
    currentUser,
}: MensajesPageProps) {
    const live = useMensajesLive(initialMensajes, contactos, solicitudes, currentUser);
    const actions = useMensajesActions(live.selectedContactoId, (newMsg) => {
        live.setMensajes((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
        });
    });

    // En pantallas móviles: controlar si estamos viendo los contactos o la conversación
    const [mobileView, setMobileView] = useState<'contacts' | 'chat'>('chat');
    const viewportRef = useRef<HTMLDivElement | null>(null);

    // Auto scroll al final dentro del contenedor con scroll sin mover la ventana exterior
    useEffect(() => {
        if (viewportRef.current) {
            viewportRef.current.scrollTo({
                top: viewportRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [live.conversationMensajes.length, live.selectedContactoId]);

    const handleSelectContact = (contactId: number) => {
        live.setSelectedContactoId(contactId);
        setMobileView('chat');
    };

    const solicitudesOptions = solicitudes
        .filter((s) => !live.selectedContactoId || s.usuarioId === live.selectedContactoId)
        .map((s) => ({ value: String(s.id), label: `${s.tipo.toUpperCase()}: ${s.asunto}` }));

    return (
        <>
            <Head title="Mensajes y Chat en Vivo" />

            <PageLayout
                title="Mensajes"
                headTitle="Mensajes"
                description=""
                icon={IconMessage}
                actions={
                    <Group gap="xs">
                        {live.connectionStatus === 'connected' ? (
                            <Badge color="green" size="lg">
                                <IconWifi size={14} />
                            </Badge>
                        ) : (
                            <Badge color="red" size="lg" >
                                <IconWifiOff size={14} />
                            </Badge>
                        )}
                    </Group>
                }
            >
                <Card
                    withBorder
                    radius="md"
                    p={0}
                    style={{
                        height: 'calc(100vh - 210px)',
                        minHeight: 500,
                        maxHeight: 'calc(100vh - 210px)',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                    }}
                >
                    <Box style={{ flex: 1, minHeight: 0, display: 'flex', width: '100%', height: '100%' }}>
                        {/* Panel izquierdo: Lista de contactos */}
                        <Box
                            style={{
                                width: '100%',
                                maxWidth: '340px',
                                flexShrink: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                minHeight: 0,
                            }}
                            className={mobileView === 'chat' ? 'contacts-panel-mobile-hidden' : ''}
                            visibleFrom="sm"
                        >
                            <Box p="sm">
                                <TextInput
                                    placeholder="Buscar contacto..."
                                    leftSection={<IconSearch size={16} />}
                                    value={live.searchContacto}
                                    onChange={(e) => live.setSearchContacto(e.currentTarget.value)}
                                    size="sm"
                                />
                            </Box>

                            <ScrollArea style={{ flex: 1, minHeight: 0 }}>
                                {live.filteredContactos.length === 0 ? (
                                    <Center p="xl">
                                        <Text size="sm" c="dimmed">
                                            No se encontraron contactos.
                                        </Text>
                                    </Center>
                                ) : (
                                    live.filteredContactos.map((contacto) => {
                                        const isSelected = contacto.id === live.selectedContactoId;
                                        const unread = live.unreadCountByContact[contacto.id] || 0;
                                        const lastMsg = live.lastMessageByContact[contacto.id];

                                        return (
                                            <Box
                                                key={contacto.id}
                                                p="md"
                                                onClick={() => handleSelectContact(contacto.id)}
                                                style={{
                                                    cursor: 'pointer',
                                                    backgroundColor: isSelected
                                                        ? 'light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-5))'
                                                        : 'transparent',
                                                    transition: 'background-color 0.15s ease',
                                                }}
                                            >
                                                <Group wrap="nowrap" justify="space-between" align="center">
                                                    <Group gap="sm" wrap="nowrap" style={{ overflow: 'hidden' }}>
                                                        <Avatar color={isSelected ? 'blue' : 'gray'} radius="xl">
                                                            {contacto.name.charAt(0).toUpperCase()}
                                                        </Avatar>
                                                        <Box style={{ overflow: 'hidden' }}>
                                                            <Text size="sm" fw={isSelected ? 700 : 500} truncate>
                                                                {contacto.name}
                                                            </Text>
                                                            <Text size="xs" c="dimmed" truncate>
                                                                {lastMsg ? lastMsg.mensaje : contacto.email}
                                                            </Text>
                                                        </Box>
                                                    </Group>

                                                    <Stack gap={4} align="flex-end" style={{ flexShrink: 0 }}>
                                                        {lastMsg && (
                                                            <Text size="xs" c="dimmed">
                                                                {formatMessageTime(lastMsg.createdAt, lastMsg.hora)}
                                                            </Text>
                                                        )}
                                                        {unread > 0 && (
                                                            <Badge size="xs" color="blue" variant="filled" circle>
                                                                {unread}
                                                            </Badge>
                                                        )}
                                                    </Stack>
                                                </Group>
                                            </Box>
                                        );
                                    })
                                )}
                            </ScrollArea>
                        </Box>

                        {/* Versión solo para móviles del selector de contactos cuando está en vista contactos */}
                        <Box
                            style={{
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                minHeight: 0,
                            }}
                            hiddenFrom="sm"
                            display={mobileView === 'contacts' ? 'flex' : 'none'}
                        >
                            <Box p="md">
                                <TextInput
                                    placeholder="Buscar contacto..."
                                    leftSection={<IconSearch size={16} />}
                                    value={live.searchContacto}
                                    onChange={(e) => live.setSearchContacto(e.currentTarget.value)}
                                    size="sm"
                                />
                            </Box>

                            <ScrollArea style={{ flex: 1, minHeight: 0 }}>
                                {live.filteredContactos.map((contacto) => {
                                    const isSelected = contacto.id === live.selectedContactoId;
                                    const unread = live.unreadCountByContact[contacto.id] || 0;
                                    const lastMsg = live.lastMessageByContact[contacto.id];

                                    return (
                                        <Box
                                            key={contacto.id}
                                            p="md"
                                            onClick={() => handleSelectContact(contacto.id)}
                                            style={{
                                                cursor: 'pointer',
                                                backgroundColor: isSelected
                                                    ? 'light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-5))'
                                                    : 'transparent',
                                            }}
                                        >
                                            <Group wrap="nowrap" justify="space-between" align="center">
                                                <Group gap="sm" wrap="nowrap" style={{ overflow: 'hidden' }}>
                                                    <Avatar color={isSelected ? 'blue' : 'gray'} radius="xl">
                                                        {contacto.name.charAt(0).toUpperCase()}
                                                    </Avatar>
                                                    <Box style={{ overflow: 'hidden' }}>
                                                        <Text size="sm" fw={isSelected ? 700 : 500} truncate>
                                                            {contacto.name}
                                                        </Text>
                                                        <Text size="xs" c="dimmed" truncate>
                                                            {lastMsg ? lastMsg.mensaje : contacto.email}
                                                        </Text>
                                                    </Box>
                                                </Group>

                                                <Stack gap={4} align="flex-end" style={{ flexShrink: 0 }}>
                                                    {lastMsg && (
                                                        <Text size="xs" c="dimmed">
                                                            {formatMessageTime(lastMsg.createdAt, lastMsg.hora)}
                                                        </Text>
                                                    )}
                                                    {unread > 0 && (
                                                        <Badge size="xs" color="blue" variant="filled" circle>
                                                            {unread}
                                                        </Badge>
                                                    )}
                                                </Stack>
                                            </Group>
                                        </Box>
                                    );
                                })}
                            </ScrollArea>
                        </Box>

                        {/* Panel derecho: Chat activo con ScrollArea propio e independiente */}
                        <Box
                            style={{
                                flex: 1,
                                minWidth: 0,
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%',
                                minHeight: 0,
                            }}
                            display={mobileView === 'chat' ? 'flex' : { base: 'none', sm: 'flex' }}
                        >
                            {live.selectedContacto ? (
                                <>
                                    {/* Cabecera del chat */}
                                    <Box p="sm" px="md" style={{ flexShrink: 0 }}>
                                        <Group justify="space-between" align="center">
                                            <Group gap="sm">
                                                <ActionIcon
                                                    variant="subtle"
                                                    color="gray"
                                                    hiddenFrom="sm"
                                                    onClick={() => setMobileView('contacts')}
                                                    aria-label="Ver contactos"
                                                >
                                                    <IconArrowLeft size={20} />
                                                </ActionIcon>
                                                <Avatar color="blue" radius="xl">
                                                    {live.selectedContacto.name.charAt(0).toUpperCase()}
                                                </Avatar>
                                                <Box>
                                                    <Text size="sm" fw={700}>
                                                        {live.selectedContacto.name}
                                                    </Text>
                                                    <Text size="xs" c="dimmed">
                                                        {live.selectedContacto.email}
                                                    </Text>
                                                </Box>
                                            </Group>
                                        </Group>
                                    </Box>

                                    {/* Flujo de mensajes con ScrollArea confinado */}
                                    <ScrollArea
                                        style={{ flex: 1, minHeight: 0 }}
                                        viewportRef={viewportRef}
                                        p="md"
                                        offsetScrollbars
                                    >
                                        {live.conversationMensajes.length === 0 ? (
                                            <Center h={280}>
                                                <Stack align="center" gap="xs">
                                                    <ThemeIcon size="xl" radius="xl" color="blue">
                                                        <IconMessage size={24} />
                                                    </ThemeIcon>
                                                    <Text size="sm" fw={600} c="dimmed">
                                                        Inicia la conversación con {live.selectedContacto.name}
                                                    </Text>
                                                </Stack>
                                            </Center>
                                        ) : (
                                            <Stack gap="sm">
                                                {live.conversationMensajes.map((msg) => {
                                                    const isMe = msg.emisorId === currentUser.id;

                                                    return (
                                                        <Flex
                                                            key={msg.id}
                                                            justify={isMe ? 'flex-end' : 'flex-start'}
                                                        >
                                                            <Box
                                                                p="xs"
                                                                px="sm"
                                                                style={{
                                                                    maxWidth: '80%',
                                                                    borderRadius: isMe
                                                                        ? '16px 16px 4px 16px'
                                                                        : '16px 16px 16px 4px',
                                                                    backgroundColor: isMe
                                                                        ? 'light-dark(var(--mantine-color-blue-6), var(--mantine-color-blue-8))'
                                                                        : 'light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-0))',
                                                                    color: isMe ? 'white' : 'var(--mantine-color-dark-8)',
                                                                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                                                                }}
                                                            >
                                                                {msg.solicitudAsunto && (
                                                                    <Badge
                                                                        size="xs"
                                                                        variant={isMe ? 'outline' : 'light'}
                                                                        color={isMe ? 'white' : 'blue'}
                                                                        mb={4}
                                                                    >
                                                                        Ref: {msg.solicitudAsunto}
                                                                    </Badge>
                                                                )}

                                                                <Text size="sm" style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                                                                    {msg.mensaje}
                                                                </Text>

                                                                <Group justify="flex-end" gap={4} mt={2}>
                                                                    <Text
                                                                        size="10px"
                                                                        c={isMe ? 'blue.1' : 'dimmed'}
                                                                    >
                                                                        {formatMessageTime(msg.createdAt, msg.hora)}
                                                                    </Text>
                                                                    {isMe && (
                                                                        <IconChecks size={12} color="rgba(255,255,255,0.8)" />
                                                                    )}
                                                                </Group>
                                                            </Box>
                                                        </Flex>
                                                    );
                                                })}
                                            </Stack>
                                        )}
                                    </ScrollArea>

                                    {/* Barra inferior para escribir mensaje fija al pie del contenedor */}
                                    <Box
                                        p="sm"
                                        px="md"
                                        style={{
                                            flexShrink: 0,
                                        }}
                                    >
                                        {solicitudesOptions.length > 0 && actions.selectedSolicitudId !== null && (
                                            <Group mb="xs">
                                                <Badge
                                                    size="sm"
                                                    color="blue"
                                                    variant="light"
                                                    rightSection={
                                                        <ActionIcon
                                                            size="xs"
                                                            color="blue"
                                                            variant="transparent"
                                                            onClick={() => actions.setSelectedSolicitudId(null)}
                                                        >
                                                            ×
                                                        </ActionIcon>
                                                    }
                                                >
                                                    Vinculado a solicitud
                                                </Badge>
                                            </Group>
                                        )}

                                        <Group gap="xs" align="flex-end">
                                            {solicitudesOptions.length > 0 && (
                                                <Tooltip label="Vincular a solicitud del residente" position="top">
                                                    <ActionIcon
                                                        size="lg"
                                                        variant={actions.selectedSolicitudId ? 'filled' : 'subtle'}
                                                        color="blue"
                                                        onClick={() => {
                                                            if (actions.selectedSolicitudId) {
                                                                actions.setSelectedSolicitudId(null);
                                                            } else {
                                                                actions.setSelectedSolicitudId(Number(solicitudesOptions[0].value));
                                                            }
                                                        }}
                                                    >
                                                        <IconPaperclip size={18} />
                                                    </ActionIcon>
                                                </Tooltip>
                                            )}

                                            <TextInput
                                                placeholder={`Escribe un mensaje para ${live.selectedContacto.name}...`}
                                                value={actions.inputText}
                                                onChange={(e) => actions.setInputText(e.currentTarget.value)}
                                                onKeyDown={actions.handleKeyDown}
                                                style={{ flex: 1 }}
                                                size="md"
                                            />

                                            <ActionIcon
                                                size="lg"
                                                color="blue"
                                                variant="filled"
                                                onClick={actions.handleSendMessage}
                                                loading={actions.sending}
                                                disabled={!actions.inputText.trim()}
                                            >
                                                <IconSend size={18} />
                                            </ActionIcon>
                                        </Group>
                                    </Box>
                                </>
                            ) : (
                                <Center h="100%">
                                    <Stack align="center" gap="sm">
                                        <ThemeIcon size={64} radius="xl" color="blue" variant="light">
                                            <IconUser size={32} />
                                        </ThemeIcon>
                                        <Text size="md" fw={600} c="dimmed">
                                            Selecciona un contacto para iniciar una conversación en vivo
                                        </Text>
                                        <Button
                                            hiddenFrom="sm"
                                            variant="light"
                                            onClick={() => setMobileView('contacts')}
                                        >
                                            Ver lista de contactos
                                        </Button>
                                    </Stack>
                                </Center>
                            )}
                        </Box>
                    </Box>
                </Card>
            </PageLayout>
        </>
    );
}
