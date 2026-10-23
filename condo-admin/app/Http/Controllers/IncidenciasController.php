<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Resources\IncidenciaResource;
use App\Models\AreaComun;
use App\Models\Incidencia;
use App\Models\Local;
use App\Models\CategoriaIncidencia;
use App\Models\User;
USE App\Http\Requests\IncidenciaRequest;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class IncidenciasController extends Controller
{
    public function index()
    {
        return Inertia::render('incidencias', [
            'incidencias' => IncidenciaResource::collection(
                Incidencia::with(['categoria', 'local', 'areaComun', 'usuario', 'admin'])
                    ->latest('fecha_reporte')
                    ->get()
            )->resolve(),
            'categorias' => CategoriaIncidencia::orderBy('nombre')->get()
                ->map(fn ($c) => ['id' => $c->id, 'label' => $c->nombre, 'activa' => $c->activa]),
            'locales' => Local::orderBy('code')->get()
                ->map(fn ($l) => ['id' => $l->id, 'label' => "{$l->code} · {$l->name}"]),
            'areasComunes' => AreaComun::orderBy('nombre')->get()
                ->map(fn ($a) => ['id' => $a->id, 'label' => $a->nombre]),
            // Ajusta el filtro a como identifiques administradores en tu app
            'admins' => User::where('role', 'admin')->orderBy('name')->get()
                ->map(fn ($u) => ['id' => $u->id, 'label' => $u->name]),
        ]);
    }

    public function store(IncidenciaRequest $request)
    {
        $data = $request->validated();
        $data['usuario_id'] = $request->user()->id;
        $this->applyTransitions(new Incidencia(), $data);

        Incidencia::create($data);
        return back();
    }

    public function update(IncidenciaRequest $request, Incidencia $incidencia)
    {
        $data = $request->validated();
        $this->applyTransitions($incidencia, $data);

        $incidencia->update($data);
        return back();
    }

    public function updateStatus(Request $request)
    {
        $data = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:incidencias,id'],
            'estado' => ['required', Rule::in(['abierta', 'asignada', 'en_proceso', 'resuelta', 'cerrada', 'cancelada'])],
        ]);

        Incidencia::whereIn('id', $data['ids'])->get()->each(function (Incidencia $incidencia) use ($data) {
            $changes = ['estado' => $data['estado']];
            $this->applyTransitions($incidencia, $changes);
            $incidencia->update($changes);
        });

        return back();
    }

    public function destroy(Incidencia $incidencia)
    {
        $incidencia->delete();
        return back();
    }

    public function destroyMany(Request $request)
    {
        $data = $request->validate(['ids' => ['required', 'array'], 'ids.*' => ['integer']]);
        Incidencia::whereIn('id', $data['ids'])->delete();
        return back();
    }

    /** Completa fecha_asignacion / fecha_resolucion y el estado según lo que cambió. */
    private function applyTransitions(Incidencia $incidencia, array &$data): void
    {
        $adminId = array_key_exists('admin_id', $data) ? $data['admin_id'] : $incidencia->admin_id;
        $estado = $data['estado'] ?? $incidencia->estado ?? 'abierta';

        // Se asignó un admin por primera vez
        if ($adminId && ! $incidencia->fecha_asignacion) {
            $data['fecha_asignacion'] = now();
            if ($estado === 'abierta') {
                $data['estado'] = $estado = 'asignada';
            }
        }

        // Se quitó el admin y seguía solo "asignada": regresa a abierta
        if (! $adminId && $estado === 'asignada') {
            $data['estado'] = 'abierta';
            $data['fecha_asignacion'] = null;
        }

        if (in_array($estado, ['resuelta', 'cerrada']) && ! $incidencia->fecha_resolucion) {
            $data['fecha_resolucion'] = now();
        } elseif (! in_array($estado, ['resuelta', 'cerrada'])) {
            $data['fecha_resolucion'] = null;
        }
    }
}
