<?php

namespace App\Http\Controllers;

use App\Http\Requests\CategoriaIncidenciaRequest;
use App\Http\Resources\CategoriaIncidenciaResource;
use App\Models\CategoriaIncidencia;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoriaIncidenciaController extends Controller
{
    public function index()
    {
        return Inertia::render('categorias-incidencia', [
            'categorias' => CategoriaIncidenciaResource::collection(
                CategoriaIncidencia::orderBy('nombre')->get()
            )->resolve(),
        ]);
    }

    public function store(CategoriaIncidenciaRequest $request)
    {
        CategoriaIncidencia::create($request->validated());

        return back();
    }

    public function update(CategoriaIncidenciaRequest $request, CategoriaIncidencia $categoria)
    {
        $categoria->update($request->validated());

        return back();
    }

    public function updateStatus(Request $request)
    {
        $data = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:categorias_incidencia,id'],
            'activa' => ['required', 'boolean'],
        ]);

        CategoriaIncidencia::whereIn('id', $data['ids'])->update(['activa' => $data['activa']]);

        return back();
    }

    public function destroy(CategoriaIncidencia $categoria)
    {
        // La FK es restrictOnDelete: si tiene incidencias, no se puede eliminar.
        if ($categoria->incidencias()->exists()) {
            return back()->withErrors([
                'delete' => "La categoría \"{$categoria->nombre}\" tiene incidencias asociadas. Desactívala en lugar de eliminarla.",
            ]);
        }

        $categoria->delete();

        return back();
    }

    public function destroyMany(Request $request)
    {
        $data = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer'],
        ]);

        // Solo se eliminan las que no están en uso.
        $categorias = CategoriaIncidencia::whereIn('id', $data['ids'])
            ->withCount('incidencias')
            ->get();

        $deletable = $categorias->where('incidencias_count', 0);
        $blocked = $categorias->where('incidencias_count', '>', 0);

        CategoriaIncidencia::whereIn('id', $deletable->pluck('id'))->delete();

        if ($blocked->isNotEmpty()) {
            return back()->withErrors([
                'delete' => 'No se eliminaron por tener incidencias asociadas: '
                    . $blocked->pluck('nombre')->join(', ')
                    . '. Puedes desactivarlas.',
            ]);
        }

        return back();
    }
}
