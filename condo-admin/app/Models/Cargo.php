<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\Pivot;

/**
 * @property int $id
 * @property int $local_id
 * @property int $cuota_id
 * @property string $periodo
 * @property string $concepto
 * @property string $monto
 * @property CarbonInterface $fecha_emision
 * @property CarbonInterface $fecha_vencimiento
 * @property bool $cancelado
 * @property string|null $motivo_cancelacion
 * @property CarbonInterface|null $created_at
 * @property CarbonInterface|null $updated_at
 * @property-read string|null $pagado Suma agregada por conAplicado().
 * @property-read string|null $reservado Suma agregada por conAplicado().
 * @property-read Pivot $pivot Fila de pago_cargo al cargarse desde un pago.
 */
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

    /**
     * Agrega lo aplicado al cargo en pago_cargo: `pagado` (solo pagos
     * validados) y `reservado` (pagos no rechazados, opcionalmente sin
     * contar uno, para recalcular un pago que se edita).
     *
     * @param  Builder<self>  $query
     */
    #[Scope]
    protected function conAplicado(Builder $query, ?int $exceptoPagoId = null): void
    {
        $query->withSum(['pagos as pagado' => fn (Builder $q) => $q->where('estado', 'validado')], 'pago_cargo.monto_aplicado')
            ->withSum(['pagos as reservado' => fn (Builder $q) => $q
                ->where('estado', '!=', 'rechazado')
                ->when($exceptoPagoId, fn (Builder $q) => $q->where('pagos.id', '!=', $exceptoPagoId)),
            ], 'pago_cargo.monto_aplicado');
    }

    /**
     * Lo que falta por pagar con pagos validados. Requiere conAplicado().
     */
    public function saldoPendiente(): float
    {
        return max(0, round((float) $this->monto - (float) $this->pagado, 2));
    }

    /**
     * Lo que aún no cubre ningún pago pendiente o validado. Requiere conAplicado().
     */
    public function saldoDisponible(): float
    {
        return max(0, round((float) $this->monto - (float) $this->reservado, 2));
    }
}
