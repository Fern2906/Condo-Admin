<?php

namespace App\Http\Requests;

use App\Concerns\SpanishValidationMessages;
use App\Models\Aviso;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Valida el formulario de alta/edición de avisos.
 * Los nombres de campo siguen el estilo camelCase del frontend (AvisoData).
 */
class AvisoRequest extends FormRequest
{
    use SpanishValidationMessages;

    /**
     * Sin fecha de publicación se conserva la del aviso o, si es nuevo, se publica ahora.
     */
    protected function prepareForValidation(): void
    {
        if ($this->filled('fechaPublicacion')) {
            return;
        }

        /** @var Aviso|null $aviso */
        $aviso = $this->route('aviso');

        $this->merge(['fechaPublicacion' => ($aviso->fecha_publicacion ?? now())->toDateTimeString()]);
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:150'],
            'contenido' => ['required', 'string'],
            'tipo' => ['required', Rule::in(Aviso::TIPOS)],
            'dirigidoA' => ['required', Rule::in(Aviso::DESTINATARIOS)],
            'fechaEvento' => ['nullable', 'date'],
            'fechaPublicacion' => ['required', 'date'],
            'fechaExpiracion' => ['nullable', 'date', 'after:fechaPublicacion'],
            'fijado' => ['required', 'boolean'],
            'activo' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'titulo' => 'título',
            'contenido' => 'contenido',
            'tipo' => 'tipo',
            'dirigidoA' => 'destinatarios',
            'fechaEvento' => 'fecha del evento',
            'fechaPublicacion' => 'fecha de publicación',
            'fechaExpiracion' => 'fecha de expiración',
            'fijado' => 'fijado',
            'activo' => 'activo',
        ];
    }

    /**
     * Datos validados con los nombres de columna de la tabla avisos.
     *
     * @return array<string, mixed>
     */
    public function avisoAttributes(): array
    {
        return [
            'titulo' => $this->validated('titulo'),
            'contenido' => $this->validated('contenido'),
            'tipo' => $this->validated('tipo'),
            'dirigido_a' => $this->validated('dirigidoA'),
            'fecha_evento' => $this->validated('fechaEvento'),
            'fecha_publicacion' => $this->validated('fechaPublicacion'),
            'fecha_expiracion' => $this->validated('fechaExpiracion'),
            'fijado' => $this->boolean('fijado'),
            'activo' => $this->boolean('activo'),
        ];
    }
}
