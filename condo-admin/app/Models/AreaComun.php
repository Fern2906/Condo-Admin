<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('areas_comunes', timestamps: false)]
#[Fillable([
    'nombre',
    'descripcion',
    'capacidad',
    'hora_apertura',
    'hora_cierre',
    'reservable',
    'requiere_aprobacion',
    'reglas',
])]
class AreaComun extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'reservable' => 'boolean',
            'requiere_aprobacion' => 'boolean',
        ];
    }

    /**
     * @return HasMany<Reservacion, $this>
     */
    public function reservaciones(): HasMany
    {
        return $this->hasMany(Reservacion::class, 'area_comun_id');
    }

    /**
     * @return HasMany<Incidencia, $this>
     */
    public function incidencias(): HasMany
    {
        return $this->hasMany(Incidencia::class, 'area_comun_id');
    }
}
