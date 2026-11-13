<?php

namespace App\Http\Requests;

use App\Concerns\SpanishValidationMessages;
use App\Models\Pago;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PagoRequest extends FormRequest
{
    use SpanishValidationMessages {
        messages as spanishMessages;
    }

    protected function prepareForValidation(): void
    {
        if (! $this->has('estado')) {
            $this->merge(['estado' => 'pendiente']);
        }
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'localId' => ['required', 'integer', 'exists:locales,id'],
            'residenteId' => ['nullable', 'integer', 'exists:users,id'],
            'monto' => ['required', 'numeric', 'min:0.01', 'max:99999999.99'],
            'fechaPago' => ['required', 'date'],
            'estado' => ['nullable', Rule::in(Pago::ESTADOS)],
            'notas' => ['nullable', 'string', 'max:255'],
            'comprobanteUrl' => ['nullable', 'string', 'max:255'],
            'motivoRechazo' => ['nullable', 'string', 'max:255'],
            'cargoIds' => ['nullable', 'array'],
            'cargoIds.*' => [
                'integer',
                'distinct',
                Rule::exists('cargos', 'id')
                    ->where('local_id', $this->integer('localId'))
                    ->where('cancelado', false),
            ],
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
            'monto' => 'monto',
            'fechaPago' => 'fecha de pago',
            'estado' => 'estado',
            'notas' => 'notas',
            'comprobanteUrl' => 'comprobante',
            'motivoRechazo' => 'motivo de rechazo',
            'cargoIds' => 'cargos',
            'cargoIds.*' => 'cargo',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function pagoAttributes(): array
    {
        return [
            'local_id' => $this->validated('localId'),
            'residente_id' => $this->validated('residenteId'),
            'monto' => $this->validated('monto'),
            'fecha_pago' => $this->validated('fechaPago'),
            'estado' => $this->validated('estado') ?? 'pendiente',
            'notas' => $this->validated('notas'),
            'comprobante_url' => $this->validated('comprobanteUrl'),
            'motivo_rechazo' => $this->validated('motivoRechazo'),
        ];
    }

    /**
     * Cargos del local que cubre el pago.
     *
     * @return list<int>
     */
    public function cargoIds(): array
    {
        return array_values(array_map('intval', $this->validated('cargoIds') ?? []));
    }
}
