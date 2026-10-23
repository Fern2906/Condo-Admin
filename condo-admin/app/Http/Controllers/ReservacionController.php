<?php

namespace App\Http\Controllers;

use App\Http\Requests\ReservacionRequest;
use App\Http\Resources\AreaComunResource;
use App\Http\Resources\ReservacionResource;
use App\Models\AreaComun;
use App\Models\Reservacion;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ReservacionController extends Controller
{
    /**
     * Mostrar la lista de reservaciones y áreas comunes al administrador.
     */
    public function index(): Response
    {
        $reservaciones = Reservacion::with(['areaComun', 'usuario', 'admin'])
            ->orderByDesc('fecha')
            ->orderBy('hora_inicio')
            ->get();

        $areas = AreaComun::withCount('reservaciones')
            ->orderBy('nombre')
            ->get();

        $usuarios = User::orderBy('name')
            ->get(['id', 'name', 'email']);

        return Inertia::render('reservaciones', [
            'reservaciones' => ReservacionResource::collection($reservaciones)->resolve(),
            'areas'         => AreaComunResource::collection($areas)->resolve(),
            'usuarios'      => $usuarios->map(fn (User $u) => ['id' => $u->id, 'name' => $u->name, 'email' => $u->email]),
        ]);
    }

    /**
     * Registrar una reservación nueva desde el panel de administración.
     */
    public function store(ReservacionRequest $request): RedirectResponse
    {
        Reservacion::create($request->reservacionAttributes());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Reservación registrada.']);

        return to_route('reservaciones.index');
    }

    /**
     * Actualizar los datos de una reservación.
     */
    public function update(ReservacionRequest $request, Reservacion $reservacion): RedirectResponse
    {
        $reservacion->update($request->reservacionAttributes());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Reservación actualizada.']);

        return to_route('reservaciones.index');
    }

    /**
     * Eliminar una reservación.
     */
    public function destroy(Reservacion $reservacion): RedirectResponse
    {
        $reservacion->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Reservación eliminada.']);

        return to_route('reservaciones.index');
    }

    /**
     * Cambiar el estado de las reservaciones seleccionadas.
     */
    public function updateStatus(Request $request): RedirectResponse
    {
        $datos = $request->validate([
            'ids'    => ['required', 'array'],
            'ids.*'  => ['integer', 'exists:reservaciones,id'],
            'estado' => ['required', Rule::in(Reservacion::ESTADOS)],
        ]);

        $actualizadas = Reservacion::whereIn('id', $datos['ids'])->update([
            'estado'   => $datos['estado'],
            'admin_id' => in_array($datos['estado'], ['aprobada', 'rechazada'])
                            ? $request->user()?->id
                            : null,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => "{$actualizadas} reservaciones marcadas como {$datos['estado']}."]);

        return to_route('reservaciones.index');
    }

    /**
     * Eliminar las reservaciones seleccionadas.
     */
    public function destroyMany(Request $request): RedirectResponse
    {
        $ids = $request->validate([
            'ids'   => ['required', 'array'],
            'ids.*' => ['integer', 'exists:reservaciones,id'],
        ])['ids'];

        $eliminadas = Reservacion::whereIn('id', $ids)->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => "Se eliminaron {$eliminadas} reservaciones."]);

        return to_route('reservaciones.index');
    }
}
