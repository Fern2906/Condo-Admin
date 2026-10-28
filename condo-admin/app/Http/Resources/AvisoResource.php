<?php

namespace App\Http\Resources;

use App\Models\Aviso;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Traduce las columnas de "avisos" (español, snake_case) a la forma
 * AvisoData que usa resources/js/pages/features/avisos/index.tsx.
 *
 * @mixin Aviso
 */
class AvisoResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'contenido' => $this->contenido,
            'tipo' => $this->tipo,
            'dirigidoA' => $this->dirigido_a,
            'fechaEvento' => $this->fecha_evento?->toDateTimeString(),
            'fechaPublicacion' => $this->fecha_publicacion->toDateTimeString(),
            'fechaExpiracion' => $this->fecha_expiracion?->toDateTimeString(),
            'fijado' => $this->fijado,
            'activo' => $this->activo,
            'vigente' => $this->estaVigente(),
            'publicadoPorId' => $this->publicado_por,
            'publicadoPorNombre' => $this->publicadoPor->name ?? '',
        ];
    }
}
