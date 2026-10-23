<?php

namespace App\Http\Resources;

use App\Models\Reservacion;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Traduce las columnas de "reservaciones" (español, snake_case) a la forma
 * ReservacionData que usa resources/js/pages/reservaciones.tsx.
 *
 * @mixin Reservacion
 */
class ReservacionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'areaComunId'    => $this->area_comun_id,
            'areaComunNombre'=> $this->areaComun?->nombre ?? '',
            'usuarioId'      => $this->usuario_id,
            'usuarioNombre'  => $this->usuario?->name ?? '',
            'usuarioEmail'   => $this->usuario?->email ?? '',
            'fecha'          => $this->fecha?->toDateString(),
            'horaInicio'     => substr((string) $this->hora_inicio, 0, 5),
            'horaFin'        => substr((string) $this->hora_fin, 0, 5),
            'numAsistentes'  => $this->num_asistentes,
            'motivo'         => $this->motivo,
            'estado'         => $this->estado,
            'motivoRechazo'  => $this->motivo_rechazo,
            'adminNombre'    => $this->admin?->name,
            'createdAt'      => $this->created_at?->toDateTimeString(),
        ];
    }
}
