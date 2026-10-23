<?php

namespace App\Http\Resources;

use App\Models\AreaComun;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Traduce las columnas de "areas_comunes" (español, snake_case) a la forma
 * AreaComunData que usa resources/js/pages/reservaciones.tsx.
 *
 * @mixin AreaComun
 */
class AreaComunResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'nombre'             => $this->nombre,
            'descripcion'        => $this->descripcion,
            'capacidad'          => $this->capacidad,
            'horaApertura'       => $this->hora_apertura,
            'horaCierre'         => $this->hora_cierre,
            'reservable'         => $this->reservable,
            'requiereAprobacion' => $this->requiere_aprobacion,
            'reglas'             => $this->reglas,
            'reservacionesCount' => $this->whenCounted('reservaciones'),
        ];
    }
}
