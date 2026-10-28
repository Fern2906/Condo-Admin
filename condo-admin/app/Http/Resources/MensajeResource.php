<?php

namespace App\Http\Resources;

use App\Models\Mensaje;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Mensaje
 */
class MensajeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'emisorId' => $this->emisor_id,
            'emisorNombre' => $this->emisor->name ?? 'Usuario',
            'emisorEmail' => $this->emisor->email ?? '',
            'receptorId' => $this->receptor_id,
            'receptorNombre' => $this->receptor?->name ?? 'Administración',
            'solicitudId' => $this->solicitud_id,
            'solicitudAsunto' => $this->solicitud?->asunto,
            'mensaje' => $this->mensaje,
            'leido' => (bool) $this->leido,
            'createdAt' => $this->created_at?->toISOString(),
            'hora' => $this->created_at?->format('H:i') ?? '',
            'fecha' => $this->created_at?->toDateString() ?? '',
        ];
    }
}

