<?php

namespace App\Http\Controllers;

use App\Http\Requests\LocatarioPagoRequest;
use App\Models\Pago;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class LocatarioPagoController extends Controller
{
    /**
     * Registrar un pago reportado por el locatario (queda pendiente de validar).
     */
    public function store(LocatarioPagoRequest $request): RedirectResponse
    {
        Pago::create($request->pagoAttributes());

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Pago reportado para validación de administración.']);

        return to_route('locatarios.dashboard');
    }
}
