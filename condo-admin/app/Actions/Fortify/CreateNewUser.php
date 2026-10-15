<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            // Campos del paso 2 del registro (auth/register.tsx)
            'telefono' => ['nullable', 'digits:10'],
            'telefono_alterno' => ['nullable', 'digits:10'],
            'contacto_emergencia' => ['nullable', 'string', 'min:3', 'max:100'],
            'telefono_emergencia' => ['nullable', 'digits:10'],
            'password' => $this->passwordRules(),
        ])->validate();

        return User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'telefono' => $input['telefono'] ?? null,
            'telefono_alterno' => $input['telefono_alterno'] ?? null,
            'contacto_emergencia' => $input['contacto_emergencia'] ?? null,
            'telefono_emergencia' => $input['telefono_emergencia'] ?? null,
            'password' => $input['password'],
        ]);
    }
}
