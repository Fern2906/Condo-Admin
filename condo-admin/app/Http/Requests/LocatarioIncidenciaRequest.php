<?php

namespace App\Http\Requests;

use App\Concerns\SpanishValidationMessages;
use App\Models\Incidencia;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Incidencia reportada por un locatario: siempre a su nombre, siempre
 * abierta y, si es de un local, solo de los suyos. No acepta estado,
 * administrador asignado, comentario ni costo de reparación.
 */
class LocatarioIncidenciaRequest extends FormRequest
{
    use SpanishValidationMessages;

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:120'],
            'descripcion' => ['required', 'string'],
            'categoria_id' => ['required', 'integer', 'exists:categorias_incidencia,id'],
            'prioridad' => ['required', Rule::in(Incidencia::PRIORIDADES)],
            'local_id' => ['nullable', 'integer', Rule::in($this->user()->locales()->pluck('locales.id'))],
            'area_comun_id' => ['nullable', 'integer', 'exists:areas_comunes,id'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'titulo' => 'título',
            'descripcion' => 'descripción',
            'categoria_id' => 'categoría',
            'prioridad' => 'prioridad',
            'local_id' => 'local',
            'area_comun_id' => 'área común',
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function incidenciaAttributes(): array
    {
        return [
            'titulo' => $this->validated('titulo'),
            'descripcion' => $this->validated('descripcion'),
            'categoria_id' => $this->validated('categoria_id'),
            'prioridad' => $this->validated('prioridad'),
            'local_id' => $this->validated('local_id'),
            'area_comun_id' => $this->validated('area_comun_id'),
            'usuario_id' => $this->user()->id,
            'estado' => 'abierta',
        ];
    }
}
