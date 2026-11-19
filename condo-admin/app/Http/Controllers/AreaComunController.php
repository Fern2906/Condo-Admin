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
    public function update(AreaComunRequest $request, AreaComun $areaComun): RedirectResponse
    {
        $areaComun->update($request->areaComunAttributes());

        Inertia::flash('toast', ['type' => 'success', 'message' => "Área \"{$areaComun->nombre}\" actualizada."]);

        return to_route('reservaciones.index');
    }

    /**
     * Eliminar un área común que no tenga reservaciones activas.
     */
    public function destroy(AreaComun $areaComun): RedirectResponse
    {
        if ($areaComun->reservaciones()->whereIn('estado', ['pendiente', 'aprobada'])->exists()) {
            Inertia::flash('toast', [
                'type'    => 'error',
                'message' => "El área \"{$areaComun->nombre}\" tiene reservaciones activas y no se puede eliminar.",
            ]);

            return to_route('reservaciones.index');
        }

        $areaComun->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => "Área \"{$areaComun->nombre}\" eliminada."]);

        return to_route('reservaciones.index');
    }
}
