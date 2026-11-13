<?php

namespace App\Http\Requests;

use App\Concerns\SpanishValidationMessages;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Pago reportado por un locatario: solo de sus propios locales y siempre
 * queda pendiente de que la administración lo valide.
 */
class LocatarioPagoRequest extends FormRequest
{
    use SpanishValidationMessages {
        messages as spanishMessages;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'localId' => ['required', 'integer', Rule::in($this->user()->locales()->pluck('locales.id'))],
            'monto' => ['required', 'numeric', 'min:0.01', 'max:99999999.99'],
            'fechaPago' => ['required', 'date'],
            'notas' => ['nullable', 'string', 'max:255'],
            'comprobanteUrl' => ['nullable', 'string', 'max:255'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'localId' => 'local',
            'monto' => 'monto',
            'fechaPago' => 'fecha de pago',
            'notas' => 'notas',
            'comprobanteUrl' => 'comprobante',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function pagoAttributes(): array
    {
        return [
            'local_id' => $this->validated('localId'),
            'residente_id' => $this->user()->id,
            'monto' => $this->validated('monto'),
            'fecha_pago' => $this->validated('fechaPago'),
            'estado' => 'pendiente',
            'notas' => $this->validated('notas'),
            'comprobante_url' => $this->validated('comprobanteUrl'),
            'registrado_por' => $this->user()->id,
        ];
    }
}
