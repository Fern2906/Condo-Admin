<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('incidencia_adjuntos', timestamps: false)]
#[Fillable(['incidencia_id', 'archivo_url', 'nombre_original', 'subido_por', 'subido_en'])]
class IncidenciaAdjunto extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['subido_en' => 'datetime'];
    }

    /**
     * @return BelongsTo<Incidencia, $this>
     */
    public function incidencia(): BelongsTo
    {
        return $this->belongsTo(Incidencia::class, 'incidencia_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function subidoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'subido_por');
    }
}
