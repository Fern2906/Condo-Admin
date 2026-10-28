<?php

namespace App\Http\Resources;

use App\Models\Pago;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Pago
 */
class PagoResource extends JsonResource
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
            'residenteNombre' => $this->residente->name ?? 'Sin residente',
            'residenteEmail' => $this->residente->email ?? '',
            'monto' => (float) $this->monto,
            'fechaPago' => $this->fecha_pago ? $this->fecha_pago->toDateString() : '',
            'comprobanteUrl' => $this->comprobante_url,
            'estado' => $this->estado,
            'registradoPorId' => $this->registrado_por,
            'registradoPorNombre' => $this->registradoPor->name ?? '',
            'validadoPorId' => $this->validado_por,
            'validadoPorNombre' => $this->validadoPor->name ?? null,
            'fechaValidacion' => $this->fecha_validacion?->toDateTimeString(),
            'motivoRechazo' => $this->motivo_rechazo,
            'notas' => $this->notas,
            'reciboFolio' => $this->recibo?->folio,
            'createdAt' => $this->created_at?->toDateTimeString(),
        ];
    }
}

