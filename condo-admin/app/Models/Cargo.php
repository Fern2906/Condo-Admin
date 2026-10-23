<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

#[Table('cargos')]
#[Fillable([
    'local_id',
    'cuota_id',
    'periodo',
    'concepto',
    'monto',
    'fecha_emision',
    'fecha_vencimiento',
    'cancelado',
    'motivo_cancelacion',
])]
class Cargo extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'monto' => 'decimal:2',
            'fecha_emision' => 'date',
            'fecha_vencimiento' => 'date',
            'cancelado' => 'boolean',
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
     * @return BelongsTo<Cuota, $this>
     */
    public function cuota(): BelongsTo
    {
        return $this->belongsTo(Cuota::class, 'cuota_id');
    }

    /**
     * @return BelongsToMany<Pago, $this>
     */
    public function pagos(): BelongsToMany
    {
        return $this->belongsToMany(Pago::class, 'pago_cargo', 'cargo_id', 'pago_id')
            ->withPivot('monto_aplicado');
    }
}
