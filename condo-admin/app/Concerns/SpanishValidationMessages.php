<?php

namespace App\Concerns;

/**
 * Mensajes de validación en español para los Form Requests del condominio.
 * La app usa APP_LOCALE=en (los mensajes de Fortify siguen en inglés), así
 * que estos mensajes se definen por request en lugar de en lang/es.
 */
trait SpanishValidationMessages
{
    /**
     * @return array<string, string|array<string, string>>
     */
    public function messages(): array
    {
        return [
            'required' => 'El campo :attribute es obligatorio.',
            'required_with' => 'El campo :attribute es obligatorio cuando se captura :values.',
            'string' => 'El campo :attribute debe ser texto.',
            'email' => 'El campo :attribute debe ser un correo válido.',
            'unique' => 'Ya existe un registro con ese :attribute.',
            'numeric' => 'El campo :attribute debe ser un número.',
            'integer' => 'El campo :attribute debe ser un número entero.',
            'boolean' => 'El campo :attribute debe ser verdadero o falso.',
            'date' => 'El campo :attribute no es una fecha válida.',
            'after' => 'El campo :attribute debe ser una fecha posterior a :date.',
            'in' => 'El valor seleccionado en :attribute no es válido.',
            'exists' => 'El valor seleccionado en :attribute no existe.',
            'min' => [
                'numeric' => 'El campo :attribute debe ser al menos :min.',
                'string' => 'El campo :attribute debe tener al menos :min caracteres.',
            ],
            'max' => [
                'numeric' => 'El campo :attribute no debe ser mayor a :max.',
                'string' => 'El campo :attribute no debe tener más de :max caracteres.',
            ],
        ];
    }
}
