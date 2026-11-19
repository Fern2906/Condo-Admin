<?php

namespace App\Concerns;

use App\Models\AreaComun;
use App\Models\Reservacion;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Support\Carbon;

/**
 * Reglas de horario de una reservación que dependen de la base de datos.
 * Las comparten la vista de administración (ReservacionRequest) y la del
 * locatario (LocatarioReservacionRequest). Se usan desde el hook after()
 * del Form Request, con los campos camelCase del frontend.
 */
trait ValidatesReservacionHorario
{
    /**
     * - La fecha no puede ser anterior a hoy.
     * - El horario debe caer dentro del horario del área.
     * - Si la reservación queda activa (pendiente o aprobada), no puede
     *   empalmarse con otra reservación activa de la misma área.
     *
     * Al editar una reservación sin mover su área, fecha ni horas, las dos
     * primeras reglas no se vuelven a exigir: así se puede cancelar o rechazar
     * una reservación pasada, o una cuyo horario de área cambió después.
     */
    protected function validarHorario(Validator $validator, string $estado, ?Reservacion $actual = null): void
    {
        if ($validator->errors()->isNotEmpty()) {
            return; // Los campos base no son válidos: no hay horario que revisar.
        }

        $area = AreaComun::findOrFail($this->integer('areaComunId'));
        $fecha = Carbon::parse($this->string('fecha')->value())->toDateString();
        $inicio = Reservacion::hora($this->string('horaInicio')->value());
        $fin = Reservacion::hora($this->string('horaFin')->value());

        $mueveHorario = $actual === null
            || (int) $actual->area_comun_id !== $area->id
            || $actual->fecha->toDateString() !== $fecha
            || Reservacion::hora($actual->hora_inicio) !== $inicio
            || Reservacion::hora($actual->hora_fin) !== $fin;

        if ($mueveHorario && $fecha < today()->toDateString()) {
            $validator->errors()->add('fecha', 'La fecha de la reservación no puede ser anterior a hoy.');
        }

        if ($mueveHorario && ! $area->abiertaEntre($inicio, $fin)) {
            $validator->errors()->add('horaInicio', sprintf(
                'El horario debe estar dentro del horario del área (%s a %s).',
                Reservacion::hora($area->hora_apertura),
                Reservacion::hora($area->hora_cierre),
            ));
        }

        if (in_array($estado, Reservacion::ESTADOS_ACTIVOS, true)) {
            $otra = Reservacion::empalmadas($area->id, $fecha, $inicio, $fin, $actual?->id)->first();

            if ($otra !== null) {
                $validator->errors()->add('horaInicio', "El área ya está reservada ese día de {$otra->horario()}.");
            }
        }
    }
}
