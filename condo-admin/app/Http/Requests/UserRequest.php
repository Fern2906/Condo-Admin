<?php

namespace App\Http\Requests;

use App\Concerns\ProfileValidationRules;
use App\Concerns\SpanishValidationMessages;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Valida el formulario de alta/edición de usuarios (userList.tsx).
 */
class UserRequest extends FormRequest
{
    use ProfileValidationRules, SpanishValidationMessages;

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var User|null $user */
        $user = $this->route('user');

        return [
            ...$this->profileRules($user?->id),
            'phone' => ['nullable', 'string', 'max:20'],
            'altPhone' => ['nullable', 'string', 'max:20'],
            'rfc' => ['nullable', 'string', 'max:13'],
            'emergencyContact' => ['nullable', 'string', 'max:120'],
            'emergencyPhone' => ['nullable', 'string', 'max:20'],
            'active' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'name' => 'nombre',
            'email' => 'correo',
            'phone' => 'teléfono',
            'altPhone' => 'teléfono alterno',
            'rfc' => 'RFC',
            'emergencyContact' => 'contacto de emergencia',
            'emergencyPhone' => 'teléfono de emergencia',
            'active' => 'activo',
        ];
    }

    /**
     * Datos validados con los nombres de columna de la tabla users.
     *
     * @return array<string, mixed>
     */
    public function userAttributes(): array
    {
        return [
            'name' => $this->validated('name'),
            'email' => $this->validated('email'),
            'telefono' => $this->validated('phone'),
            'telefono_alterno' => $this->validated('altPhone'),
            'rfc' => $this->validated('rfc'),
            'contacto_emergencia' => $this->validated('emergencyContact'),
            'telefono_emergencia' => $this->validated('emergencyPhone'),
            'activo' => $this->boolean('active'),
        ];
    }
}
