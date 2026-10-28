<?php

namespace App\Http\Controllers;

use App\Http\Requests\ContratoRequest;
use App\Http\Resources\ContratoResource;
use App\Models\Local;
use App\Models\ResidenteLocal;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Los contratos son los registros de residente_local: qué residente ocupa
 * (o es dueño de) qué local, y entre qué fechas.
 */
class ContratoController extends Controller
{
    /**
     * Mostrar los contratos de los locales, primero los más próximos a vencer.
     */
    public function index(): Response
    {
        $contratos = ResidenteLocal::with(['local', 'residente'])
            // Los contratos sin fecha de fin van al final.
            ->orderByRaw('fecha_fin is null')
            ->orderBy('fecha_fin')
            ->get();

        $locales = Local::orderBy('codigo')->get(['id', 'codigo', 'nombre']);

        $residentes = User::orderBy('name')->get(['id', 'name', 'email']);

        return Inertia::render('features/contratos/index', [
            'contratos' => ContratoResource::collection($contratos)->resolve(),
            'locales' => $locales->map(fn (Local $l) => ['id' => $l->id, 'label' => "{$l->codigo} · {$l->nombre}"]),
            'residentes' => $residentes->map(fn (User $u) => ['id' => $u->id, 'name' => $u->name, 'email' => $u->email]),
        ]);
    }

    /**
     * Registrar un contrato nuevo entre un residente y un local.
     */
    public function store(ContratoRequest $request): RedirectResponse
    {
        ResidenteLocal::create($request->contratoAttributes());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Contrato registrado.']);

        return to_route('contratos.index');
    }

    /**
     * Actualizar los datos y las fechas de un contrato.
     */
    public function update(ContratoRequest $request, ResidenteLocal $contrato): RedirectResponse
    {
        $contrato->update($request->contratoAttributes());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Contrato actualizado.']);

        return to_route('contratos.index');
    }

    /**
     * Eliminar un contrato. El residente y el local se conservan.
     */
    public function destroy(ResidenteLocal $contrato): RedirectResponse
    {
        $contrato->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Contrato eliminado.']);

        return to_route('contratos.index');
    }

    /**
     * Eliminar los contratos seleccionados.
     */
    public function destroyMany(Request $request): RedirectResponse
    {
        $ids = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:residente_local,id'],
        ])['ids'];

        $eliminados = ResidenteLocal::whereIn('id', $ids)->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => "Se eliminaron {$eliminados} contratos."]);

        return to_route('contratos.index');
    }
}
