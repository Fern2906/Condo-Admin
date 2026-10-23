<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('avisos', timestamps: false)]
#[Fillable([
    'titulo',
    'contenido',
    'tipo',
    'dirigido_a',
    'fecha_evento',
    'fecha_publicacion',
    'fecha_expiracion',
    'fijado',
    'publicado_por',
    'activo',
])]
class Aviso extends Model
{
    public const TIPOS = ['general', 'mantenimiento', 'evento', 'urgente'];

    public const DESTINATARIOS = ['todos', 'propietarios', 'locatarios', 'administradores'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'fecha_evento' => 'datetime',
            'fecha_publicacion' => 'datetime',
            'fecha_expiracion' => 'datetime',
            'fijado' => 'boolean',
            'activo' => 'boolean',
        ];
    }

    /**
     * Avisos activos que no han expirado.
     *
     * @param  Builder<self>  $query
     */
    #[Scope]
    protected function vigentes(Builder $query): void
    {
        $query->where('activo', true)
            ->where(fn (Builder $q) => $q->whereNull('fecha_expiracion')->orWhere('fecha_expiracion', '>', now()));
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function publicadoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'publicado_por');
    }
}
