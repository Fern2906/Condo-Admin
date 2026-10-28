<?php

namespace App\Http\Requests;

use App\Concerns\SpanishValidationMessages;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class MensajeRequest extends FormRequest
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
            'receptorId' => ['nullable', 'integer', 'exists:users,id'],
            'solicitudId' => ['nullable', 'integer', 'exists:solicitudes,id'],
            'mensaje' => ['required', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'receptorId' => 'destinatario',
            'solicitudId' => 'solicitud',
            'mensaje' => 'mensaje',
        ];
    }
}

