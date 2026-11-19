<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property Carbon $fecha Columna date con cast a fecha (ver casts()).
 */
#[Table('reservaciones')]
#[Fillable([
    'area_comun_id',
    'usuario_id',
    'fecha',
    'hora_inicio',
    'hora_fin',
    'num_asistentes',
    'motivo',
    'estado',
    'admin_id',
    'motivo_rechazo',
])]
class Reservacion extends Model
{
    public const ESTADOS = ['pendiente', 'aprobada', 'rechazada', 'cancelada'];

    /**
     * Estados que ocupan el área. Una reservación rechazada o cancelada libera
     * su horario; una pendiente lo aparta hasta que se apruebe o rechace.
     */
    public const ESTADOS_ACTIVOS = ['pendiente', 'aprobada'];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['fecha' => 'date'];
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
     * Normaliza una hora a "HH:MM". Las horas llegan como "10:00" desde los
     * formularios y algunos motores las guardan como "10:00:00"; en ese
     * formato fijo sí se pueden comparar como texto.
     */
    public static function hora(string $hora): string
    {
        return substr($hora, 0, 5);
    }

    /**
     * Reservaciones activas de la misma área y fecha cuyo horario se empalma
     * con [inicio, fin). Terminar a la hora en que empieza otra no es empalme.
     *
     * @return Collection<int, Reservacion>
     */
    public static function empalmadas(int $areaComunId, string $fecha, string $horaInicio, string $horaFin, ?int $exceptoId = null): Collection
    {
        $inicio = self::hora($horaInicio);
        $fin = self::hora($horaFin);

        return self::query()
            ->where('area_comun_id', $areaComunId)
            ->whereDate('fecha', $fecha)
            ->whereIn('estado', self::ESTADOS_ACTIVOS)
            ->when($exceptoId !== null, fn ($query) => $query->whereKeyNot($exceptoId))
            ->orderBy('hora_inicio')
            ->get()
            ->filter(fn (Reservacion $otra) => self::hora($otra->hora_inicio) < $fin && self::hora($otra->hora_fin) > $inicio)
            ->values();
    }

    /**
     * Texto corto del horario, p. ej. "10:00 a 12:00".
     */
    public function horario(): string
    {
        return self::hora($this->hora_inicio).' a '.self::hora($this->hora_fin);
    }
}
