<?php

namespace App\Http\Resources;

use App\Models\Local;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Forma UserData que usa resources/js/pages/userList.tsx.
 *
 * @mixin User
 */
class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var Local|null $local */
        $local = $this->locales->first();

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->telefono,
            'altPhone' => $this->telefono_alterno,
            'rfc' => $this->rfc,
            'emergencyContact' => $this->contacto_emergencia,
            'emergencyPhone' => $this->telefono_emergencia,
            'active' => $this->activo,
            'verified' => $this->email_verified_at !== null,
            'local' => $local === null ? null : [
                'id' => $local->id,
                'code' => $local->codigo,
                'name' => $local->nombre,
                'building' => $local->edificio,
                'level' => $local->nivel ?? '',
                'status' => $local->estado,
            ],
            'localesCount' => $this->locales->count(),
        ];
    }
}
