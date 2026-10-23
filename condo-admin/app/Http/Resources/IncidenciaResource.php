<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IncidenciaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'descripcion' => $this->descripcion,
            'categoria_id' => $this->categoria_id,
            'categoria' => $this->categoria->nombre,
            'local_id' => $this->local_id,
            'local' => $this->local ? "{$this->local->code} · {$this->local->name}" : null,
            'area_comun_id' => $this->area_comun_id,
            'area_comun' => $this->areaComun?->nombre,
            'prioridad' => $this->prioridad,
            'estado' => $this->estado,
            'comentario' => $this->comentario,
            'usuario' => $this->usuario->name,
            'admin_id' => $this->admin_id,
            'admin' => $this->admin?->name,
            'fecha_reporte' => $this->fecha_reporte?->toIso8601String(),
            'fecha_asignacion' => $this->fecha_asignacion?->toIso8601String(),
            'fecha_resolucion' => $this->fecha_resolucion?->toIso8601String(),
            'costo_reparacion' => $this->costo_reparacion !== null ? (float) $this->costo_reparacion : null,
        ];
    }
}
