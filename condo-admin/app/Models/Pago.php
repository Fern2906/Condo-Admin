<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

#[Table('pagos')]
#[Fillable([
    'local_id',
    'residente_id',
    'monto',
    'fecha_pago',
    'comprobante_url',
    'estado',
    'registrado_por',
    'validado_por',
    'fecha_validacion',
    'motivo_rechazo',
    'notas',
])]
class Pago extends Model
{
    public const ESTADOS = ['pendiente', 'validado', 'rechazado'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'monto' => 'decimal:2',
            'fecha_pago' => 'date',
            'fecha_validacion' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Local, $this>
     */
    public function local(): BelongsTo
    {
        return $this->belongsTo(Local::class, 'local_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function residente(): BelongsTo
    {
        return $this->belongsTo(User::class, 'residente_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function registradoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'registrado_por');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function validadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validado_por');
    }

    /**
     * @return BelongsToMany<Cargo, $this>
     */
    public function cargos(): BelongsToMany
    {
        return $this->belongsToMany(Cargo::class, 'pago_cargo', 'pago_id', 'cargo_id')
            ->withPivot('monto_aplicado');
    }

    /**
     * @return HasOne<Recibo, $this>
     */
    public function recibo(): HasOne
    {
        return $this->hasOne(Recibo::class, 'pago_id');
    }
}
