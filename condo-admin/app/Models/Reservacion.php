<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('reservaciones')]
#[Fillable([
    'area_comun_id',
    'usuario_id',
    'fecha',
    'hora_inicio',
    'hora_fin',
    'num_asistentes',
    'motivo',
    'estado',
    'admin_id',
    'motivo_rechazo',
])]
class Reservacion extends Model
{
    public const ESTADOS = ['pendiente', 'aprobada', 'rechazada', 'cancelada'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['fecha' => 'date'];
    }

    /**
     * @return BelongsTo<AreaComun, $this>
     */
    public function areaComun(): BelongsTo
    {
        return $this->belongsTo(AreaComun::class, 'area_comun_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
