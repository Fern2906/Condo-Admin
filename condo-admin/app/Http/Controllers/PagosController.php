<?php

namespace App\Http\Controllers;

use App\Http\Requests\PagoRequest;
use App\Http\Resources\PagoResource;
use App\Models\Cargo;
use App\Models\Cuota;
use App\Models\Local;
use App\Models\Pago;
use App\Models\Recibo;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class PagosController extends Controller
{
    /**
     * Muestra la lista de pagos y cuotas del condominio.
     */
    public function index(): Response
    {
        $pagos = Pago::with(['local', 'residente', 'registradoPor', 'validadoPor', 'recibo', 'cargos'])
            ->orderByDesc('fecha_pago')
            ->orderByDesc('id')
            ->get();

        $locales = Local::orderBy('codigo')->get(['id', 'codigo', 'nombre']);
        $residentes = User::orderBy('name')->get(['id', 'name', 'email']);
        $cuotas = Cuota::where('activa', true)->orderBy('nombre')->get(['id', 'nombre', 'tipo', 'monto']);
        $cargos = Cargo::conAplicado()
            ->where('cancelado', false)
            ->orderBy('fecha_vencimiento')
            ->orderBy('id')
            ->get();

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
            'cargos' => $cargos->map(fn (Cargo $c) => [
                'id' => $c->id,
                'localId' => $c->local_id,
                'concepto' => $c->concepto,
                'periodo' => $c->periodo,
                'monto' => (float) $c->monto,
                'disponible' => $c->saldoDisponible(),
                'fechaVencimiento' => $c->fecha_vencimiento->toDateString(),
            ]),
        ]);
    }

    /**
     * Registrar un nuevo pago.
     */
    public function store(PagoRequest $request): RedirectResponse
    {
        $userId = $request->user()->id;

        DB::transaction(function () use ($request, $userId) {
            $attributes = $request->pagoAttributes();
            $attributes['registrado_por'] = $userId;

            if ($attributes['estado'] === 'validado') {
                $attributes['validado_por'] = $userId;
                $attributes['fecha_validacion'] = now();
            }

            $pago = Pago::create($attributes);

            $this->aplicarACargos($pago, $request->cargoIds());
            $this->sincronizarRecibo($pago, $userId);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Pago registrado exitosamente.']);

        return to_route('pagos.index');
    }

    /**
     * Actualizar los datos de un pago.
     */
    public function update(PagoRequest $request, Pago $pago): RedirectResponse
    {
        $userId = $request->user()->id;
        $attributes = $request->pagoAttributes();
        $cargoIds = $request->cargoIds();

        // Un pago validado ya tiene recibo: su local, monto y cargos no cambian
        // mientras siga validado. Para corregirlos se regresa a pendiente.
        $sigueValidado = $pago->estado === 'validado' && $attributes['estado'] === 'validado';

        if ($sigueValidado) {
            $this->impedirCambiosConRecibo($pago, $attributes, $cargoIds);
        }

        DB::transaction(function () use ($pago, $attributes, $cargoIds, $userId, $sigueValidado) {
            if ($attributes['estado'] === 'validado' && $pago->estado !== 'validado') {
                $attributes['validado_por'] = $userId;
                $attributes['fecha_validacion'] = now();
            } elseif ($attributes['estado'] !== 'validado') {
                $attributes['validado_por'] = null;
                $attributes['fecha_validacion'] = null;
            }

            $pago->update($attributes);

            if (! $sigueValidado) {
                $this->aplicarACargos($pago, $cargoIds);
            }

            $this->sincronizarRecibo($pago, $userId);
        });

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

        $userId = $request->user()->id;

        DB::transaction(function () use ($data, $userId) {
            foreach (Pago::whereIn('id', $data['ids'])->get() as $pago) {
                $updateData = [
                    'estado' => $data['estado'],
                    'motivo_rechazo' => $data['estado'] === 'rechazado' ? ($data['motivoRechazo'] ?? null) : null,
                ];

                if ($data['estado'] !== 'validado') {
                    $updateData['validado_por'] = null;
                    $updateData['fecha_validacion'] = null;
                } elseif ($pago->estado !== 'validado') {
                    $updateData['validado_por'] = $userId;
                    $updateData['fecha_validacion'] = now();
                }

                $pago->update($updateData);

                if ($pago->estado === 'rechazado') {
                    $pago->cargos()->sync([]);
                }

                $this->sincronizarRecibo($pago, $userId);
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Estado de pago(s) actualizado.']);

        return to_route('pagos.index');
    }

    /**
     * Eliminar un pago individual.
     */
    public function destroy(Pago $pago): RedirectResponse
    {
        DB::transaction(function () use ($pago) {
            $pago->recibo?->delete();
            $pago->delete();
        });

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

        $eliminados = DB::transaction(function () use ($ids) {
            Recibo::whereIn('pago_id', $ids)->delete();

            return Pago::whereIn('id', $ids)->delete();
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => "Se eliminaron {$eliminados} pagos."]);

        return to_route('pagos.index');
    }

    /**
     * Reparte el monto del pago entre los cargos, en orden de vencimiento y
     * sin rebasar lo que cada cargo tiene disponible. Un pago rechazado no
     * cubre ningún cargo.
     *
     * @param  list<int>  $cargoIds
     */
    private function aplicarACargos(Pago $pago, array $cargoIds): void
    {
        if ($pago->estado === 'rechazado' || $cargoIds === []) {
            $pago->cargos()->sync([]);

            return;
        }

        $cargos = Cargo::conAplicado($pago->id)
            ->whereIn('id', $cargoIds)
            ->orderBy('fecha_vencimiento')
            ->orderBy('id')
            ->get();

        // En centavos para no arrastrar errores de punto flotante.
        $restante = (int) round((float) $pago->monto * 100);
        $aplicaciones = [];

        foreach ($cargos as $cargo) {
            $disponible = (int) round($cargo->saldoDisponible() * 100);

            if ($disponible === 0) {
                throw ValidationException::withMessages(['cargoIds' => "El cargo «{$cargo->concepto}» ya está cubierto por otro pago."]);
            }

            if ($restante === 0) {
                throw ValidationException::withMessages(['cargoIds' => 'El monto del pago no alcanza para todos los cargos seleccionados.']);
            }

            $aplicar = min($disponible, $restante);
            $aplicaciones[$cargo->id] = ['monto_aplicado' => $aplicar / 100];
            $restante -= $aplicar;
        }

        $pago->cargos()->sync($aplicaciones);
    }

    /**
     * Rechaza la edición si cambia el local, el monto o los cargos de un pago
     * que ya tiene recibo.
     *
     * @param  array<string, mixed>  $attributes
     * @param  list<int>  $cargoIds
     */
    private function impedirCambiosConRecibo(Pago $pago, array $attributes, array $cargoIds): void
    {
        $mensaje = 'No se puede cambiar en un pago validado con recibo. Regrésalo a pendiente para corregirlo.';
        $errores = [];

        if ((int) $attributes['local_id'] !== $pago->local_id) {
            $errores['localId'] = $mensaje;
        }

        if (round((float) $attributes['monto'], 2) !== round((float) $pago->monto, 2)) {
            $errores['monto'] = $mensaje;
        }

        $actuales = $pago->cargos()->pluck('cargos.id')->map(fn ($id) => (int) $id)->sort()->values()->all();
        sort($cargoIds);

        if ($cargoIds !== $actuales) {
            $errores['cargoIds'] = $mensaje;
        }

        if ($errores !== []) {
            throw ValidationException::withMessages($errores);
        }
    }

    /**
     * Mantiene el recibo al día con el estado: se emite (o se reactiva) al
     * validar y se cancela cuando el pago deja de estar validado.
     */
    private function sincronizarRecibo(Pago $pago, int $userId): void
    {
        $recibo = $pago->recibo()->first();

        if ($pago->estado === 'validado') {
            if (! $recibo) {
                Recibo::create([
                    'pago_id' => $pago->id,
                    'folio' => 'REC-'.now()->format('Ymd').'-'.str_pad((string) $pago->id, 4, '0', STR_PAD_LEFT),
                    'fecha_emision' => now(),
                    'emitido_por' => $userId,
                    'cancelado' => false,
                ]);
            } elseif ($recibo->cancelado) {
                $recibo->update(['cancelado' => false, 'fecha_emision' => now(), 'emitido_por' => $userId]);
            }
        } elseif ($recibo && ! $recibo->cancelado) {
            $recibo->update(['cancelado' => true]);
        }

        $pago->unsetRelation('recibo');
    }
}
