<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('cuotas')]
#[Fillable([
    'nombre',
    'tipo',
    'periodicidad',
    'monto',
    'dia_vencimiento',
    'descripcion',
    'activa',
    'creado_por',
])]
class Cuota extends Model
{
    public const TIPOS = ['ordinaria', 'extraordinaria', 'renta', 'multa', 'otro'];

    public const PERIODICIDADES = ['unica', 'mensual', 'bimestral', 'trimestral', 'semestral', 'anual'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'monto' => 'decimal:2',
            'dia_vencimiento' => 'date',
            'activa' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function creador(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creado_por');
    }

    /**
     * @return HasMany<Cargo, $this>
     */
    public function cargos(): HasMany
    {
        return $this->hasMany(Cargo::class, 'cuota_id');
    }
}
