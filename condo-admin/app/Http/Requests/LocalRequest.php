<?php

namespace App\Http\Requests;

use App\Concerns\SpanishValidationMessages;
use App\Models\Local;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Valida el formulario de alta/edición de locales. Los nombres de campo son
 * los de LocalData (locales.tsx) para que los errores se muestren en el input.
 */
class LocalRequest extends FormRequest
{
    use SpanishValidationMessages;

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Local|null $local */
        $local = $this->route('local');

        return [
            'code' => ['required', 'string', 'max:20', Rule::unique(Local::class, 'codigo')->ignore($local)],
            'name' => ['required', 'string', 'max:150'],
            'businessType' => ['nullable', 'string', 'max:80'],
            'building' => ['required', 'string', 'max:30'],
            'level' => ['nullable', 'string', 'max:30'],
            'area' => ['nullable', 'numeric', 'min:0', 'max:999999.99'],
            'monthlyRent' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'maintenanceFee' => ['required', 'numeric', 'min:0', 'max:99999999.99'],
            'status' => ['required', Rule::in(Local::ESTADOS)],
            'tenantName' => ['nullable', 'required_with:tenantMail', 'string', 'max:255'],
            'tenantMail' => ['nullable', 'required_with:tenantName', 'email', 'max:255'],
            'tenantPhone' => ['nullable', 'string', 'max:20'],
            'contractEnd' => ['nullable', 'date'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'code' => 'código',
            'name' => 'nombre',
            'businessType' => 'giro',
            'building' => 'edificio',
            'level' => 'nivel',
            'area' => 'superficie',
            'monthlyRent' => 'renta mensual',
            'maintenanceFee' => 'mantenimiento',
            'status' => 'estado',
            'tenantName' => 'nombre del locatario',
            'tenantMail' => 'correo del locatario',
            'tenantPhone' => 'teléfono del locatario',
            'contractEnd' => 'fin de contrato',
        ];
    }

    /**
     * Datos validados con los nombres de columna de la tabla locales.
     *
     * @return array<string, mixed>
     */
    public function localAttributes(): array
    {
        return [
            'codigo' => $this->validated('code'),
            'nombre' => $this->validated('name'),
            'giro' => $this->validated('businessType'),
            'edificio' => $this->validated('building'),
            'nivel' => $this->validated('level'),
            'superficie_m2' => $this->validated('area'),
            'renta_mensual' => $this->validated('monthlyRent'),
            'cuota_mantenimiento' => $this->validated('maintenanceFee'),
            'estado' => $this->validated('status'),
        ];
    }
}
