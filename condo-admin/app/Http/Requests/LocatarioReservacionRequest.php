<?php

namespace App\Http\Requests;

use App\Concerns\SpanishValidationMessages;
use App\Concerns\ValidatesReservacionHorario;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Reservación solicitada por un locatario: siempre a su nombre y siempre
 * pendiente de que la administración la apruebe. No acepta usuario, estado
 * ni datos de aprobación/rechazo.
 */
class LocatarioReservacionRequest extends FormRequest
{
    use SpanishValidationMessages, ValidatesReservacionHorario;

    /**
     * @return array<int, Closure(Validator): void>
     */
    public function after(): array
    {
        return [
            fn (Validator $validator) => $this->validarHorario($validator, 'pendiente'),
        ];
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'areaComunId' => ['required', 'integer', 'exists:areas_comunes,id'],
            'fecha' => ['required', 'date'],
            'horaInicio' => ['required', 'date_format:H:i'],
            'horaFin' => ['required', 'date_format:H:i', 'after:horaInicio'],
            'numAsistentes' => ['nullable', 'integer', 'min:1', 'max:9999'],
            'motivo' => ['nullable', 'string', 'max:150'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'areaComunId' => 'área común',
            'fecha' => 'fecha',
            'horaInicio' => 'hora de inicio',
            'horaFin' => 'hora de fin',
            'numAsistentes' => 'número de asistentes',
            'motivo' => 'motivo',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function reservacionAttributes(): array
    {
        return [
            'area_comun_id' => $this->validated('areaComunId'),
            'usuario_id' => $this->user()->id,
            'fecha' => $this->validated('fecha'),
            'hora_inicio' => $this->validated('horaInicio'),
            'hora_fin' => $this->validated('horaFin'),
            'num_asistentes' => $this->validated('numAsistentes'),
            'motivo' => $this->validated('motivo'),
            'estado' => 'pendiente',
            'admin_id' => null,
            'motivo_rechazo' => null,
        ];
    }
}
