<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Table('roles', timestamps: false)]
#[Fillable(['nombre'])]
class Rol extends Model
{
    public const ADMINISTRADOR = 'administrador';

    public const PROPIETARIO = 'propietario';

    public const LOCATARIO = 'locatario';

    /**
     * @return HasMany<User, $this>
     */
    public function usuarios(): HasMany
    {
        return $this->hasMany(User::class, 'rol_id');
    }
}
