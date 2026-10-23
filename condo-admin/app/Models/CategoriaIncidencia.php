<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('categorias_incidencia', timestamps: false)]
#[Fillable(['nombre', 'descripcion', 'activa'])]
class CategoriaIncidencia extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['activa' => 'boolean'];
    }

    /**
     * @return HasMany<Incidencia, $this>
     */
    public function incidencias(): HasMany
    {
        return $this->hasMany(Incidencia::class, 'categoria_id');
    }
}
