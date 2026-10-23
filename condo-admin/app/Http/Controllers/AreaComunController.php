<?php

namespace App\Http\Controllers;

use App\Http\Requests\AreaComunRequest;
use App\Http\Resources\AreaComunResource;
use App\Models\AreaComun;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class AreaComunController extends Controller
{
    /**
     * Registrar un área común nueva.
     */
    public function store(AreaComunRequest $request): RedirectResponse
    {
        AreaComun::create($request->areaComunAttributes());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Área común registrada.']);

        return to_route('reservaciones.index');
    }

    /**
     * Actualizar un área común existente.
     */
    public function update(AreaComunRequest $request, AreaComun $areaComunum): RedirectResponse
    {
        $areaComunum->update($request->areaComunAttributes());

        Inertia::flash('toast', ['type' => 'success', 'message' => "Área \"{$areaComunum->nombre}\" actualizada."]);

        return to_route('reservaciones.index');
    }

    /**
     * Eliminar un área común que no tenga reservaciones activas.
     */
    public function destroy(AreaComun $areaComunum): RedirectResponse
    {
        if ($areaComunum->reservaciones()->whereIn('estado', ['pendiente', 'aprobada'])->exists()) {
            Inertia::flash('toast', [
                'type'    => 'error',
                'message' => "El área \"{$areaComunum->nombre}\" tiene reservaciones activas y no se puede eliminar.",
            ]);

            return to_route('reservaciones.index');
        }

        $areaComunum->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => "Área \"{$areaComunum->nombre}\" eliminada."]);

        return to_route('reservaciones.index');
    }
}
