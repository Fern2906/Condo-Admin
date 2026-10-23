<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Database\Factories\LocalFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property int $id
 * @property string $codigo
 * @property string $nombre
 * @property string|null $giro
 * @property string $edificio
 * @property string|null $nivel
 * @property string|null $superficie_m2
 * @property string $renta_mensual
 * @property string $cuota_mantenimiento
 * @property string $estado
 * @property bool $activo
 * @property CarbonInterface|null $created_at
 * @property CarbonInterface|null $updated_at
 */
#[Table('locales')]
#[Fillable([
    'codigo',
    'nombre',
    'giro',
    'edificio',
    'nivel',
    'superficie_m2',
    'renta_mensual',
    'cuota_mantenimiento',
    'estado',
    'activo',
])]
class Local extends Model
{
    /** @use HasFactory<LocalFactory> */
    use HasFactory;

    /** Valores del enum "estado" de la tabla locales. */
    public const ESTADOS = ['Disponible', 'Ocupado', 'Mantenimiento', 'Reservado'];

    protected static function booted(): void
    {
        // residente_local tiene restrictOnDelete: hay que quitar las relaciones antes de borrar.
        static::deleting(fn (Local $local) => $local->residentes()->detach());
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'superficie_m2' => 'decimal:2',
            'renta_mensual' => 'decimal:2',
            'cuota_mantenimiento' => 'decimal:2',
            'activo' => 'boolean',
        ];
    }

    /**
     * Todos los residentes ligados al local (propietarios, locatarios, etc.).
     *
     * @return BelongsToMany<User, $this>
     */
    public function residentes(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'residente_local', 'local_id', 'residente_id')
            ->withPivot(['id', 'tipo_relacion', 'habita_local', 'responsable_pago', 'fecha_inicio', 'fecha_fin']);
    }

    /**
     * Relación con el locatario actual; un local tiene a lo más uno.
     *
     * @return HasOne<ResidenteLocal, $this>
     */
    public function locatario(): HasOne
    {
        return $this->hasOne(ResidenteLocal::class, 'local_id')
            ->where('tipo_relacion', 'locatario');
    }

    /**
     * @return HasMany<Cargo, $this>
     */
    public function cargos(): HasMany
    {
        return $this->hasMany(Cargo::class, 'local_id');
    }

    /**
     * @return HasMany<Pago, $this>
     */
    public function pagos(): HasMany
    {
        return $this->hasMany(Pago::class, 'local_id');
    }

    /**
     * @return HasMany<Incidencia, $this>
     */
    public function incidencias(): HasMany
    {
        return $this->hasMany(Incidencia::class, 'local_id');
    }

    /**
     * @return HasMany<Solicitud, $this>
     */
    public function solicitudes(): HasMany
    {
        return $this->hasMany(Solicitud::class, 'local_id');
    }

    /**
     * Asigna (o quita, si $residente es null) el locatario del local.
     * Si el locatario cambia, la relación se reinicia con fecha_inicio de hoy.
     */
    public function asignarLocatario(?User $residente, ?CarbonInterface $fechaFin = null): void
    {
        if ($residente === null) {
            $this->locatario()->delete();
            $this->unsetRelation('locatario');

            return;
        }

        $relacion = $this->locatario()->first()
            ?? $this->locatario()->make(['tipo_relacion' => 'locatario']);

        if ($relacion->residente_id !== $residente->id) {
            $relacion->residente_id = $residente->id;
            $relacion->fecha_inicio = now();
        }

        $relacion->fecha_fin = $fechaFin;
        $relacion->save();

        $this->setRelation('locatario', $relacion);
    }

    /**
     * Los cargos y pagos tienen restrictOnDelete, así que un local con
     * historial financiero no se puede borrar.
     */
    public function tieneHistorialFinanciero(): bool
    {
        return $this->cargos()->exists() || $this->pagos()->exists();
    }
}
