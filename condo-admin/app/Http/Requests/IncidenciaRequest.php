<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IncidenciaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:120'],
            'descripcion' => ['required', 'string'],
            'categoria_id' => ['required', 'integer', 'exists:categorias_incidencia,id'],
            'local_id' => ['nullable', 'integer', 'exists:locales,id'],
            'area_comun_id' => ['nullable', 'integer', 'exists:areas_comunes,id'],
            'prioridad' => ['required', Rule::in(['baja', 'media', 'alta', 'urgente'])],
            'estado' => ['sometimes', Rule::in(['abierta', 'asignada', 'en_proceso', 'resuelta', 'cerrada', 'cancelada'])],
            'admin_id' => ['nullable', 'integer', 'exists:users,id'],
            'comentario' => ['nullable', 'string'],
            'costo_reparacion' => ['nullable', 'numeric', 'min:0', 'max:99999999.99'],
        ];
    }
}
