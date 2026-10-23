<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;

/**
 * @property int $id
 * @property int|null $rol_id
 * @property string $name
 * @property string $email
 * @property string|null $telefono
 * @property string|null $telefono_alterno
 * @property string|null $rfc
 * @property string|null $contacto_emergencia
 * @property string|null $telefono_emergencia
 * @property bool $activo
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $two_factor_secret
 * @property string|null $two_factor_recovery_codes
 * @property Carbon|null $two_factor_confirmed_at
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'name',
    'email',
    'password',
    'telefono',
    'telefono_alterno',
    'rfc',
    'contacto_emergencia',
    'telefono_emergencia',
    'activo',
])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail, PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
            'activo' => 'boolean',
        ];
    }

    /**
     * @return BelongsTo<Rol, $this>
     */
    public function rol(): BelongsTo
    {
        return $this->belongsTo(Rol::class, 'rol_id');
    }

    /**
     * Estas tablas apuntan a users con restrictOnDelete, así que un usuario
     * con registros en ellas no se puede borrar (se debe bloquear).
     */
    public function tieneRegistrosAsociados(): bool
    {
        return Pago::where('registrado_por', $this->id)->exists()
            || Recibo::where('emitido_por', $this->id)->exists()
            || Incidencia::where('usuario_id', $this->id)->exists()
            || Reservacion::where('usuario_id', $this->id)->exists()
            || Aviso::where('publicado_por', $this->id)->exists()
            || Documento::where('subido_por', $this->id)->exists()
            || Solicitud::where('usuario_id', $this->id)->exists();
    }

    /**
     * Locales con los que el usuario está relacionado (tabla residente_local).
     *
     * @return BelongsToMany<Local, $this>
     */
    public function locales(): BelongsToMany
    {
        return $this->belongsToMany(Local::class, 'residente_local', 'residente_id', 'local_id')
            ->withPivot(['id', 'tipo_relacion', 'habita_local', 'responsable_pago', 'fecha_inicio', 'fecha_fin']);
    }
}
