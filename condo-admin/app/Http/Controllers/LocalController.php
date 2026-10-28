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
     * Mostrar la lista de locales comerciales.
     */
    public function index(): Response
    {
        $locales = Local::with('locatario.residente')->orderBy('codigo')->get();

        return Inertia::render('features/locales/index', [
            'locales' => LocalResource::collection($locales)->resolve(),
        ]);
    }

    /**
     * Registrar un local comercial nuevo y, opcionalmente, su locatario.
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
     * Actualizar un local comercial y su locatario.
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
     * Eliminar un local comercial sin historial financiero.
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
     * Eliminar los locales seleccionados, omitiendo los que tienen historial financiero.
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
     * Cambiar el estado de los locales seleccionados.
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
     * Buscar al locatario por correo (o crearlo) y actualizar sus datos de contacto.
     * Devuelve null cuando el formulario no trae locatario, lo que desasigna el local.
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
