<?php

namespace App\Http\Requests;

use App\Concerns\SpanishValidationMessages;
use App\Models\AreaComun;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Valida el formulario de alta/edición de áreas comunes.
 * Los nombres de campo siguen el estilo camelCase del frontend (AreaComunData).
 */
class AreaComunRequest extends FormRequest
{
    use SpanishValidationMessages;

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var AreaComun|null $area */
        $area = $this->route('area_comun');

        return [
            'nombre'             => ['required', 'string', 'max:80', Rule::unique(AreaComun::class, 'nombre')->ignore($area)],
            'descripcion'        => ['nullable', 'string', 'max:255'],
            'capacidad'          => ['nullable', 'integer', 'min:1', 'max:9999'],
            'horaApertura'       => ['required', 'date_format:H:i'],
            'horaCierre'         => ['required', 'date_format:H:i', 'after:horaApertura'],
            'reservable'         => ['required', 'boolean'],
            'requiereAprobacion' => ['required', 'boolean'],
            'reglas'             => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'nombre'             => 'nombre',
            'descripcion'        => 'descripción',
            'capacidad'          => 'capacidad',
            'horaApertura'       => 'hora de apertura',
            'horaCierre'         => 'hora de cierre',
            'reservable'         => 'reservable',
            'requiereAprobacion' => 'requiere aprobación',
            'reglas'             => 'reglas',
        ];
    }

    /**
     * Datos validados con los nombres de columna de la tabla areas_comunes.
     *
     * @return array<string, mixed>
     */
    public function areaComunAttributes(): array
    {
        return [
            'nombre'              => $this->validated('nombre'),
            'descripcion'         => $this->validated('descripcion'),
            'capacidad'           => $this->validated('capacidad'),
            'hora_apertura'       => $this->validated('horaApertura'),
            'hora_cierre'         => $this->validated('horaCierre'),
            'reservable'          => $this->boolean('reservable'),
            'requiere_aprobacion' => $this->boolean('requiereAprobacion'),
            'reglas'              => $this->validated('reglas'),
        ];
    }
}
