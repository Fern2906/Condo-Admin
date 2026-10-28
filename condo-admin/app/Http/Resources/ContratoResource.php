<?php

namespace App\Http\Resources;

use App\Models\ResidenteLocal;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Traduce las columnas de "residente_local" (español, snake_case) a la forma
 * ContratoData que usa resources/js/pages/features/contratos/index.tsx.
 *
 * @mixin ResidenteLocal
 */
class ContratoResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'localId' => $this->local_id,
            'localCodigo' => $this->local->codigo ?? '',
            'localNombre' => $this->local->nombre ?? '',
            'residenteId' => $this->residente_id,
            'residenteNombre' => $this->residente->name ?? '',
            'residenteEmail' => $this->residente->email ?? '',
            'residenteTelefono' => $this->residente?->telefono,
            'tipoRelacion' => $this->tipo_relacion,
            'habitaLocal' => $this->habita_local,
            'responsablePago' => $this->responsable_pago,
            'fechaInicio' => $this->fecha_inicio->toDateString(),
            'fechaFin' => $this->fecha_fin?->toDateString(),
            // Negativo si el contrato ya venció; null si no tiene fecha de fin.
            'diasRestantes' => $this->fecha_fin ? (int) today()->diffInDays($this->fecha_fin, false) : null,
        ];
    }
}
