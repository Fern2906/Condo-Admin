<?php

namespace App\Http\Resources;

use App\Models\Local;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Traduce las columnas de "locales" (español, snake_case) a la forma
 * LocalData que usa resources/js/pages/locales.tsx.
 *
 * @mixin Local
 */
class LocalResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $locatario = $this->locatario;
        $residente = $locatario?->residente;

        return [
            'id' => $this->id,
            'code' => $this->codigo,
            'name' => $this->nombre,
            'businessType' => $this->giro ?? '',
            'building' => $this->edificio,
            'level' => $this->nivel ?? '',
            'area' => (float) $this->superficie_m2,
            'monthlyRent' => (float) $this->renta_mensual,
            'maintenanceFee' => (float) $this->cuota_mantenimiento,
            'status' => $this->estado,
            'tenantName' => $residente?->name,
            'tenantMail' => $residente?->email,
            'tenantPhone' => $residente?->telefono,
            'contractEnd' => $locatario?->fecha_fin?->toDateString(),
        ];
    }
}
