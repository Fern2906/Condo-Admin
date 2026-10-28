<?php

namespace App\Http\Requests;

use App\Concerns\SpanishValidationMessages;
use App\Models\ResidenteLocal;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Valida el formulario de alta/edición de contratos. Un contrato es un
 * registro de residente_local (residente ligado a un local con sus fechas).
 * Los nombres de campo siguen el estilo camelCase del frontend (ContratoData).
 */
class ContratoRequest extends FormRequest
{
    use SpanishValidationMessages {
        messages as spanishMessages;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var ResidenteLocal|null $contrato */
        $contrato = $this->route('contrato');

        return [
            'localId' => [
                'required', 'integer', 'exists:locales,id',
                // Local::locatario() es HasOne: un local tiene a lo más un locatario.
                Rule::when($this->input('tipoRelacion') === 'locatario', [
                    Rule::unique(ResidenteLocal::class, 'local_id')->where('tipo_relacion', 'locatario')->ignore($contrato),
                ]),
            ],
            'residenteId' => [
                'required', 'integer', 'exists:users,id',
                Rule::unique(ResidenteLocal::class, 'residente_id')->where('local_id', $this->integer('localId'))->ignore($contrato),
            ],
            'tipoRelacion' => ['required', Rule::in(ResidenteLocal::TIPOS)],
            'habitaLocal' => ['required', 'boolean'],
            'responsablePago' => ['required', 'boolean'],
            'fechaInicio' => ['required', 'date'],
            'fechaFin' => ['nullable', 'date', 'after:fechaInicio'],
        ];
    }

    /**
     * @return array<string, string|array<string, string>>
     */
    public function messages(): array
    {
        return [
            ...$this->spanishMessages(),
            'localId.unique' => 'El local ya tiene un locatario con contrato.',
            'residenteId.unique' => 'El residente ya tiene un contrato en este local.',
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'localId' => 'local',
            'residenteId' => 'residente',
            'tipoRelacion' => 'tipo de relación',
            'habitaLocal' => 'habita el local',
            'responsablePago' => 'responsable de pago',
            'fechaInicio' => 'fecha de inicio',
            'fechaFin' => 'fecha de fin',
        ];
    }

    /**
     * Datos validados con los nombres de columna de la tabla residente_local.
     *
     * @return array<string, mixed>
     */
    public function contratoAttributes(): array
    {
        return [
            'local_id' => $this->validated('localId'),
            'residente_id' => $this->validated('residenteId'),
            'tipo_relacion' => $this->validated('tipoRelacion'),
            'habita_local' => $this->boolean('habitaLocal'),
            'responsable_pago' => $this->boolean('responsablePago'),
            'fecha_inicio' => $this->validated('fechaInicio'),
            'fecha_fin' => $this->validated('fechaFin'),
        ];
    }
}
