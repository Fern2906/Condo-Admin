<?php

namespace App\Http\Requests;

use App\Concerns\SpanishValidationMessages;
use App\Models\Reservacion;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Valida el formulario de alta/edición de reservaciones (vista admin).
 * Los nombres de campo siguen el estilo camelCase del frontend (ReservacionData).
 */
class ReservacionRequest extends FormRequest
{
    use SpanishValidationMessages;

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'areaComunId'   => ['required', 'integer', 'exists:areas_comunes,id'],
            'usuarioId'     => ['required', 'integer', 'exists:users,id'],
            'fecha'         => ['required', 'date'],
            'horaInicio'    => ['required', 'date_format:H:i'],
            'horaFin'       => ['required', 'date_format:H:i', 'after:horaInicio'],
            'numAsistentes' => ['nullable', 'integer', 'min:1', 'max:9999'],
            'motivo'        => ['nullable', 'string', 'max:150'],
            'estado'        => ['required', Rule::in(Reservacion::ESTADOS)],
            'motivoRechazo' => ['nullable', 'required_if:estado,rechazada', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'areaComunId'   => 'área común',
            'usuarioId'     => 'usuario',
            'fecha'         => 'fecha',
            'horaInicio'    => 'hora de inicio',
            'horaFin'       => 'hora de fin',
            'numAsistentes' => 'número de asistentes',
            'motivo'        => 'motivo',
            'estado'        => 'estado',
            'motivoRechazo' => 'motivo de rechazo',
        ];
    }

    /**
     * Datos validados con los nombres de columna de la tabla reservaciones.
     *
     * @return array<string, mixed>
     */
    public function reservacionAttributes(): array
    {
        return [
            'area_comun_id'  => $this->validated('areaComunId'),
            'usuario_id'     => $this->validated('usuarioId'),
            'fecha'          => $this->validated('fecha'),
            'hora_inicio'    => $this->validated('horaInicio'),
            'hora_fin'       => $this->validated('horaFin'),
            'num_asistentes' => $this->validated('numAsistentes'),
            'motivo'         => $this->validated('motivo'),
            'estado'         => $this->validated('estado'),
            'admin_id'       => in_array($this->validated('estado'), ['aprobada', 'rechazada'])
                                    ? $this->user()?->id
                                    : null,
            'motivo_rechazo' => $this->validated('estado') === 'rechazada'
                                    ? $this->validated('motivoRechazo')
                                    : null,
        ];
    }
}
