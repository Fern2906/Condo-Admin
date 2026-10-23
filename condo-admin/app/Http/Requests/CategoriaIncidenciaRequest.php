<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CategoriaIncidenciaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // En update, el parámetro de ruta {categoria} es el modelo ya resuelto.
        $id = $this->route('categoria')?->id;

        return [
            'nombre' => [
                'required',
                'string',
                'max:60',
                Rule::unique('categorias_incidencia', 'nombre')->ignore($id),
            ],
            'descripcion' => ['nullable', 'string', 'max:150'],
            'activa' => ['required', 'boolean'],
        ];
    }

    public function attributes(): array
    {
        return [
            'nombre' => 'nombre',
            'descripcion' => 'descripción',
            'activa' => 'estado',
        ];
    }

    public function messages(): array
    {
        return [
            'nombre.required' => 'El nombre de la categoría es obligatorio.',
            'nombre.max' => 'El nombre no puede superar los 60 caracteres.',
            'nombre.unique' => 'Ya existe una categoría con ese nombre.',
            'descripcion.max' => 'La descripción no puede superar los 150 caracteres.',
        ];
    }
}
