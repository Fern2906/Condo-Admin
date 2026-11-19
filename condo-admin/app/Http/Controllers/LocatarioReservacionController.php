<?php

namespace App\Http\Controllers;

use App\Http\Requests\LocatarioReservacionRequest;
use App\Models\Reservacion;
use Illuminate\Http\RedirectResponse;

class LocatarioReservacionController extends Controller
{
    /**
     * Registrar la solicitud de reservación del locatario (queda pendiente de aprobar).
     */
    public function store(LocatarioReservacionRequest $request): RedirectResponse
    {
        Reservacion::create($request->reservacionAttributes());

        // El dashboard del locatario ya muestra su propio aviso de éxito.
        return to_route('locatarios.dashboard');
    }
}
