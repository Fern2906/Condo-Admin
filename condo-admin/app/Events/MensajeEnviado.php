<?php

namespace App\Events;

use App\Models\Mensaje;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MensajeEnviado implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * @var array<string, mixed>
     */
    public array $mensaje;

    public function __construct(Mensaje $mensajeModel)
    {
        $mensajeModel->load(['emisor', 'receptor', 'solicitud']);

        $this->mensaje = [
            'id' => $mensajeModel->id,
            'emisorId' => $mensajeModel->emisor_id,
            'emisorNombre' => $mensajeModel->emisor->name ?? 'Usuario',
            'emisorEmail' => $mensajeModel->emisor->email ?? '',
            'receptorId' => $mensajeModel->receptor_id,
            'receptorNombre' => $mensajeModel->receptor?->name ?? 'Administración',
            'solicitudId' => $mensajeModel->solicitud_id,
            'mensaje' => $mensajeModel->mensaje,
            'leido' => $mensajeModel->leido,
            'createdAt' => $mensajeModel->created_at?->toISOString() ?? now()->toISOString(),
            'hora' => $mensajeModel->created_at?->format('H:i') ?? now()->format('H:i'),
        ];
    }

    /**
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [
            new Channel('chat.condominio'),
        ];

        if (! empty($this->mensaje['receptorId'])) {
            $channels[] = new PrivateChannel('chat.user.' . $this->mensaje['receptorId']);
        }

        if (! empty($this->mensaje['emisorId'])) {
            $channels[] = new PrivateChannel('chat.user.' . $this->mensaje['emisorId']);
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'MensajeEnviado';
    }
}

