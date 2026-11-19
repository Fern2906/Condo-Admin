<?php

namespace App\Http\Controllers;

use App\Http\Requests\LocatarioIncidenciaRequest;
use App\Models\Incidencia;
use Illuminate\Http\RedirectResponse;

class LocatarioIncidenciaController extends Controller
{
    /**
     * Registrar una incidencia reportada por el locatario (queda abierta).
     */
    public function store(LocatarioIncidenciaRequest $request): RedirectResponse
    {
        Incidencia::create($request->incidenciaAttributes());

        // El dashboard del locatario ya muestra su propio aviso de éxito.
        return to_route('locatarios.dashboard');
    }
}
