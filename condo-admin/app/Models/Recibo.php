<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Table('recibos', timestamps: false)]
#[Fillable(['pago_id', 'folio', 'fecha_emision', 'archivo_url', 'emitido_por', 'cancelado'])]
class Recibo extends Model
{
    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'fecha_emision' => 'datetime',
            'cancelado' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Pago, $this>
     */
    public function pago(): BelongsTo
    {
        return $this->belongsTo(Pago::class, 'pago_id');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function emisor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'emitido_por');
    }
}
