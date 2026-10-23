<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('solicitudes')]
#[Fillable(['usuario_id', 'local_id', 'tipo', 'asunto', 'mensaje', 'estado'])]
class Solicitud extends Model
{
    public const TIPOS = ['queja', 'sugerencia', 'consulta', 'tramite'];

    public const ESTADOS = ['pendiente', 'en_revision', 'atendida', 'cerrada'];

    /**
     * @return BelongsTo<User, $this>
     */
    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    /**
     * @return BelongsTo<Local, $this>
     */
    public function local(): BelongsTo
    {
        return $this->belongsTo(Local::class, 'local_id');
    }
}
