<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('incidencias')]
#[Fillable([
    'titulo',
    'descripcion',
    'categoria_id',
    'local_id',
    'area_comun_id',
    'prioridad',
    'estado',
    'comentario',
    'usuario_id',
    'admin_id',
    'fecha_reporte',
    'fecha_asignacion',
    'fecha_resolucion',
    'costo_reparacion',
])]
class Incidencia extends Model
{
    public const PRIORIDADES = ['baja', 'media', 'alta', 'urgente'];

    public const ESTADOS = ['abierta', 'asignada', 'en_proceso', 'resuelta', 'cerrada', 'cancelada'];

    /** Estados que todavía requieren atención. */
    public const ESTADOS_ABIERTOS = ['abierta', 'asignada', 'en_proceso'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'fecha_reporte' => 'datetime',
            'fecha_asignacion' => 'datetime',
            'fecha_resolucion' => 'datetime',
            'costo_reparacion' => 'decimal:2',
        ];
    }

    /**
     * @param  Builder<self>  $query
     */
    #[Scope]
    protected function abiertas(Builder $query): void
    {
        $query->whereIn('estado', self::ESTADOS_ABIERTOS);
    }

    /**
     * @return BelongsTo<CategoriaIncidencia, $this>
     */
    public function categoria(): BelongsTo
    {
        return $this->belongsTo(CategoriaIncidencia::class, 'categoria_id');
    }

    /**
     * @return BelongsTo<Local, $this>
     */
    public function local(): BelongsTo
    {
        return $this->belongsTo(Local::class, 'local_id');
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

    /**
     * @return HasMany<IncidenciaAdjunto, $this>
     */
    public function adjuntos(): HasMany
    {
        return $this->hasMany(IncidenciaAdjunto::class, 'incidencia_id');
    }
}
