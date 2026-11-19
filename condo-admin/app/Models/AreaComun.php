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

    /**
     * Indica si el horario [inicio, fin] cae dentro del horario del área.
     * El cierre siempre es posterior a la apertura (AreaComunRequest).
     */
    public function abiertaEntre(string $horaInicio, string $horaFin): bool
    {
        return Reservacion::hora($horaInicio) >= Reservacion::hora($this->hora_apertura)
            && Reservacion::hora($horaFin) <= Reservacion::hora($this->hora_cierre);
    }
}
