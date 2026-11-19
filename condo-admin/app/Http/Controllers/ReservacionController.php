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
use Illuminate\Support\Facades\DB;
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

        return Inertia::render('features/reservaciones/index', [
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

        $cambios = [
            'estado'   => $datos['estado'],
            'admin_id' => in_array($datos['estado'], ['aprobada', 'rechazada'])
                            ? $request->user()?->id
                            : null,
        ];
        $activa = in_array($datos['estado'], Reservacion::ESTADOS_ACTIVOS, true);

        // Se revisan una por una y en orden: al activar (pendiente o aprobada)
        // no pueden quedar dos reservaciones activas empalmadas, tampoco dos de
        // la misma selección. Las que chocan se omiten y se avisa cuáles fueron.
        [$actualizadas, $omitidas] = DB::transaction(function () use ($datos, $cambios, $activa) {
            $actualizadas = 0;
            $omitidas = collect();

            $reservaciones = Reservacion::with('areaComun')->whereIn('id', $datos['ids'])->orderBy('id')->get();

            foreach ($reservaciones as $reservacion) {
                if ($activa && Reservacion::empalmadas(
                    $reservacion->area_comun_id,
                    $reservacion->fecha->toDateString(),
                    $reservacion->hora_inicio,
                    $reservacion->hora_fin,
                    $reservacion->id,
                )->isNotEmpty()) {
                    $omitidas->push($reservacion);

                    continue;
                }

                $reservacion->update($cambios);
                $actualizadas++;
            }

            return [$actualizadas, $omitidas];
        });

        $mensaje = "{$actualizadas} reservaciones marcadas como {$datos['estado']}.";

        if ($omitidas->isNotEmpty()) {
            $mensaje .= ' No se cambiaron '
                .$omitidas->map(fn (Reservacion $r) => "{$r->areaComun?->nombre} {$r->fecha->format('d/m/Y')} {$r->horario()}")->join(', ')
                .' porque se empalman con otra reservación activa.';
        }

        Inertia::flash('toast', ['type' => $omitidas->isEmpty() ? 'success' : 'warning', 'message' => $mensaje]);

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
