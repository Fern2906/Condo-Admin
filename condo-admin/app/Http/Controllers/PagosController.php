<?php

namespace App\Http\Controllers;

use App\Http\Requests\PagoRequest;
use App\Http\Resources\PagoResource;
use App\Models\Cuota;
use App\Models\Local;
use App\Models\Pago;
use App\Models\Recibo;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class PagosController extends Controller
{
    /**
     * Muestra la lista de pagos y cuotas del condominio.
     */
    public function index(): Response
    {
        $pagos = Pago::with(['local', 'residente', 'registradoPor', 'validadoPor', 'recibo'])
            ->orderByDesc('fecha_pago')
            ->orderByDesc('id')
            ->get();

        $locales = Local::orderBy('codigo')->get(['id', 'codigo', 'nombre']);
        $residentes = User::orderBy('name')->get(['id', 'name', 'email']);
        $cuotas = Cuota::where('activa', true)->orderBy('nombre')->get(['id', 'nombre', 'tipo', 'monto']);

        return Inertia::render('features/pagos/index', [
            'pagos' => PagoResource::collection($pagos)->resolve(),
            'locales' => $locales->map(fn (Local $l) => ['id' => $l->id, 'label' => "{$l->codigo} · {$l->nombre}"]),
            'residentes' => $residentes->map(fn (User $u) => ['id' => $u->id, 'name' => $u->name, 'email' => $u->email]),
            'cuotas' => $cuotas->map(fn (Cuota $c) => [
                'id' => $c->id,
                'nombre' => $c->nombre,
                'tipo' => $c->tipo,
                'monto' => (float) $c->monto,
            ]),
        ]);
    }

    /**
     * Registrar un nuevo pago.
     */
    public function store(PagoRequest $request): RedirectResponse
    {
        $attributes = $request->pagoAttributes();
        $attributes['registrado_por'] = $request->user()->id;

        if (($attributes['estado'] ?? 'pendiente') === 'validado') {
            $attributes['validado_por'] = $request->user()->id;
            $attributes['fecha_validacion'] = now();
        }

        $pago = Pago::create($attributes);

        if ($pago->estado === 'validado') {
            $this->generarRecibo($pago, $request->user()->id);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Pago registrado exitosamente.']);

        return to_route('pagos.index');
    }

    /**
     * Actualizar los datos de un pago.
     */
    public function update(PagoRequest $request, Pago $pago): RedirectResponse
    {
        $attributes = $request->pagoAttributes();

        if ($attributes['estado'] === 'validado' && $pago->estado !== 'validado') {
            $attributes['validado_por'] = $request->user()->id;
            $attributes['fecha_validacion'] = now();
        } elseif ($attributes['estado'] !== 'validado') {
            $attributes['validado_por'] = null;
            $attributes['fecha_validacion'] = null;
        }

        $pago->update($attributes);

        if ($pago->estado === 'validado' && ! $pago->recibo) {
            $this->generarRecibo($pago, $request->user()->id);
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Pago actualizado exitosamente.']);

        return to_route('pagos.index');
    }

    /**
     * Actualizar el estado de uno o varios pagos (validar / rechazar / pendiente).
     */
    public function updateStatus(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:pagos,id'],
            'estado' => ['required', Rule::in(Pago::ESTADOS)],
            'motivoRechazo' => ['nullable', 'string', 'max:255'],
        ]);

        $pagos = Pago::whereIn('id', $data['ids'])->get();

        foreach ($pagos as $pago) {
            $updateData = [
                'estado' => $data['estado'],
                'motivo_rechazo' => $data['estado'] === 'rechazada' || $data['estado'] === 'rechazado' ? ($data['motivoRechazo'] ?? null) : null,
            ];

            if ($data['estado'] === 'validado') {
                $updateData['validado_por'] = $request->user()->id;
                $updateData['fecha_validacion'] = now();
                $pago->update($updateData);
                $this->generarRecibo($pago, $request->user()->id);
            } else {
                $updateData['validado_por'] = null;
                $updateData['fecha_validacion'] = null;
                $pago->update($updateData);
            }
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Estado de pago(s) actualizado.']);

        return to_route('pagos.index');
    }

    /**
     * Eliminar un pago individual.
     */
    public function destroy(Pago $pago): RedirectResponse
    {
        if ($pago->recibo) {
            $pago->recibo->delete();
        }

        $pago->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Pago eliminado exitosamente.']);

        return to_route('pagos.index');
    }

    /**
     * Eliminar múltiples pagos.
     */
    public function destroyMany(Request $request): RedirectResponse
    {
        $ids = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:pagos,id'],
        ])['ids'];

        Recibo::whereIn('pago_id', $ids)->delete();
        $eliminados = Pago::whereIn('id', $ids)->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => "Se eliminaron {$eliminados} pagos."]);

        return to_route('pagos.index');
    }

    private function generarRecibo(Pago $pago, int $userId): void
    {
        if ($pago->recibo) {
            return;
        }

        $folio = 'REC-'.now()->format('Ymd').'-'.str_pad((string) $pago->id, 4, '0', STR_PAD_LEFT);

        Recibo::create([
            'pago_id' => $pago->id,
            'folio' => $folio,
            'fecha_emision' => now(),
            'emitido_por' => $userId,
            'cancelado' => false,
        ]);
    }
}

