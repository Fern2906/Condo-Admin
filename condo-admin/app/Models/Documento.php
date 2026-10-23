<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('documentos', timestamps: false)]
#[Fillable([
    'titulo',
    'descripcion',
    'archivo_url',
    'tipo_mime',
    'tamano_bytes',
    'visible_residentes',
    'subido_por',
    'subido_en',
])]
class Documento extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'visible_residentes' => 'boolean',
            'subido_en' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function subidoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'subido_por');
    }
}
