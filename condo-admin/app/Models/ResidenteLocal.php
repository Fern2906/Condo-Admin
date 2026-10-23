<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Tabla intermedia residente_local, usada como modelo para poder
 * consultar directamente la relación (p. ej. el locatario de un local).
 *
 * @property int $id
 * @property int $residente_id
 * @property int $local_id
 * @property string $tipo_relacion
 * @property bool $habita_local
 * @property bool $responsable_pago
 * @property CarbonInterface $fecha_inicio
 * @property CarbonInterface|null $fecha_fin
 */
#[Table('residente_local', timestamps: false)]
#[Fillable([
    'residente_id',
    'local_id',
    'tipo_relacion',
    'habita_local',
    'responsable_pago',
    'fecha_inicio',
    'fecha_fin',
])]
class ResidenteLocal extends Model
{
    public const TIPOS = ['propietario', 'locatario', 'otro'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'habita_local' => 'boolean',
            'responsable_pago' => 'boolean',
            'fecha_inicio' => 'date',
            'fecha_fin' => 'date',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function residente(): BelongsTo
    {
        return $this->belongsTo(User::class, 'residente_id');
    }

    /**
     * @return BelongsTo<Local, $this>
     */
    public function local(): BelongsTo
    {
        return $this->belongsTo(Local::class, 'local_id');
    }
}
