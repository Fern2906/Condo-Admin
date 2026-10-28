<?php

namespace App\Http\Controllers;

use App\Http\Requests\AvisoRequest;
use App\Http\Resources\AvisoResource;
use App\Models\Aviso;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AvisoController extends Controller
{
    /**
     * Mostrar los avisos del condominio: primero los fijados y luego los más recientes.
     */
    public function index(): Response
    {
        $avisos = Aviso::with('publicadoPor')
            ->orderByDesc('fijado')
            ->orderByDesc('fecha_publicacion')
            ->get();

        return Inertia::render('features/avisos/index', [
            'avisos' => AvisoResource::collection($avisos)->resolve(),
        ]);
    }

    /**
     * Publicar un aviso nuevo a nombre del administrador en sesión.
     */
    public function store(AvisoRequest $request): RedirectResponse
    {
        Aviso::create([
            ...$request->avisoAttributes(),
            'publicado_por' => $request->user()->id,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Aviso publicado.']);

        return to_route('avisos.index');
    }

    /**
     * Actualizar el contenido y la vigencia de un aviso.
     */
    public function update(AvisoRequest $request, Aviso $aviso): RedirectResponse
    {
        $aviso->update($request->avisoAttributes());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Aviso actualizado.']);

        return to_route('avisos.index');
    }

    /**
     * Eliminar un aviso.
     */
    public function destroy(Aviso $aviso): RedirectResponse
    {
        $aviso->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Aviso eliminado.']);

        return to_route('avisos.index');
    }

    /**
     * Activar o desactivar los avisos seleccionados.
     */
    public function updateStatus(Request $request): RedirectResponse
    {
        $ids = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:avisos,id'],
            'activo' => ['required', 'boolean'],
        ])['ids'];

        $activo = $request->boolean('activo');
        $actualizados = Aviso::whereIn('id', $ids)->update(['activo' => $activo]);
        $estado = $activo ? 'activados' : 'desactivados';

        Inertia::flash('toast', ['type' => 'success', 'message' => "{$actualizados} avisos {$estado}."]);

        return to_route('avisos.index');
    }

    /**
     * Eliminar los avisos seleccionados.
     */
    public function destroyMany(Request $request): RedirectResponse
    {
        $ids = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:avisos,id'],
        ])['ids'];

        $eliminados = Aviso::whereIn('id', $ids)->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => "Se eliminaron {$eliminados} avisos."]);

        return to_route('avisos.index');
    }
}
