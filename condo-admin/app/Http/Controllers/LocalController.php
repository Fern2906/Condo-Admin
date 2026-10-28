<?php

namespace App\Http\Controllers;

use App\Http\Requests\LocalRequest;
use App\Http\Resources\LocalResource;
use App\Models\Local;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class LocalController extends Controller
{
    /**
     * Show the list of commercial units.
     */
    public function index(): Response
    {
        $locales = Local::with('locatario.residente')->orderBy('codigo')->get();

        return Inertia::render('features/locales/index', [
            'locales' => LocalResource::collection($locales)->resolve(),
        ]);
    }

    /**
     * Register a new commercial unit and, optionally, its tenant.
     */
    public function store(LocalRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request) {
            $local = Local::create($request->localAttributes());

            $local->asignarLocatario($this->resolveTenant($request), $request->date('contractEnd'));
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Local registrado.']);

        return to_route('locales.index');
    }

    /**
     * Update a commercial unit and its tenant.
     */
    public function update(LocalRequest $request, Local $local): RedirectResponse
    {
        DB::transaction(function () use ($request, $local) {
            $local->update($request->localAttributes());

            $local->asignarLocatario($this->resolveTenant($request), $request->date('contractEnd'));
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => "Local {$local->codigo} actualizado."]);

        return to_route('locales.index');
    }

    /**
     * Delete a commercial unit without financial history.
     */
    public function destroy(Local $local): RedirectResponse
    {
        if ($local->tieneHistorialFinanciero()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => "El local {$local->codigo} tiene cargos o pagos registrados y no se puede eliminar.",
            ]);

            return to_route('locales.index');
        }

        DB::transaction(fn () => $local->delete());

        Inertia::flash('toast', ['type' => 'success', 'message' => "Local {$local->codigo} eliminado."]);

        return to_route('locales.index');
    }

    /**
     * Delete the selected commercial units, skipping those with financial history.
     */
    public function destroyMany(Request $request): RedirectResponse
    {
        $ids = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:locales,id'],
        ])['ids'];

        [$conHistorial, $eliminables] = Local::findMany($ids)
            ->partition(fn (Local $local) => $local->tieneHistorialFinanciero());

        DB::transaction(fn () => $eliminables->each(fn (Local $local) => $local->delete()));

        $mensaje = "Se eliminaron {$eliminables->count()} locales.";

        if ($conHistorial->isNotEmpty()) {
            $mensaje .= ' No se eliminaron '.$conHistorial->pluck('codigo')->join(', ').' porque tienen cargos o pagos.';
        }

        Inertia::flash('toast', ['type' => $conHistorial->isEmpty() ? 'success' : 'warning', 'message' => $mensaje]);

        return to_route('locales.index');
    }

    /**
     * Change the status of the selected commercial units.
     */
    public function updateStatus(Request $request): RedirectResponse
    {
        $datos = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:locales,id'],
            'status' => ['required', Rule::in(Local::ESTADOS)],
        ]);

        $actualizados = Local::whereIn('id', $datos['ids'])->update(['estado' => $datos['status']]);

        Inertia::flash('toast', ['type' => 'success', 'message' => "{$actualizados} locales marcados como {$datos['status']}."]);

        return to_route('locales.index');
    }

    /**
     * Find the tenant by email (or create it) and update its contact data.
     * Returns null when the form has no tenant, which unassigns the unit.
     */
    private function resolveTenant(LocalRequest $request): ?User
    {
        $email = $request->validated('tenantMail');

        if (! $email) {
            return null;
        }

        $residente = User::firstOrNew(['email' => $email]);
        $residente->name = $request->validated('tenantName');
        $residente->telefono = $request->validated('tenantPhone');

        if (! $residente->exists) {
            // El locatario puede definir su contraseña con "¿Olvidaste tu contraseña?"
            $residente->password = Str::password(32);
        }

        $residente->save();

        return $residente;
    }
}
