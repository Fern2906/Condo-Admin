<?php

namespace App\Http\Controllers;

use App\Models\AreaComun;
use App\Models\Aviso;
use App\Models\Cargo;
use App\Models\CategoriaIncidencia;
use App\Models\Incidencia;
use App\Models\Mensaje;
use App\Models\Pago;
use App\Models\Reservacion;
use App\Models\ResidenteLocal;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LocatarioDashboardController extends Controller
{
    /**
     * Muestra el panel principal del locatario.
     */
    public function __invoke(Request $request): Response
    {
        $user = $request->user()->loadMissing(['rol', 'locales']);

        $locales = $user->locales;
        $localPrincipal = $locales->first();
        $localIds = $locales->pluck('id');

        // Información del local principal (o null si aún no tiene asignado)
        $localData = null;
        if ($localPrincipal) {
            $localData = [
                'id' => $localPrincipal->id,
                'codigo' => $localPrincipal->codigo,
                'nombre' => $localPrincipal->nombre,
                'giro' => $localPrincipal->giro,
                'edificio' => $localPrincipal->edificio,
                'nivel' => $localPrincipal->nivel,
                'superficieM2' => (float) $localPrincipal->superficie_m2,
                'rentaMensual' => (float) $localPrincipal->renta_mensual,
                'cuotaMantenimiento' => (float) $localPrincipal->cuota_mantenimiento,
                'estado' => $localPrincipal->estado,
            ];
        }

        // Información de su contrato actual
        $contratoActual = ResidenteLocal::with('local')
            ->where('residente_id', $user->id)
            ->latest('id')
            ->first();

        $contratoData = null;
        if ($contratoActual) {
            $fechaFin = $contratoActual->fecha_fin;
            $diasRestantes = $fechaFin ? (int) now()->startOfDay()->diffInDays($fechaFin->startOfDay(), false) : null;
            $estadoContrato = 'Vigente';
            if ($fechaFin) {
                if ($diasRestantes < 0) {
                    $estadoContrato = 'Vencido';
                } elseif ($diasRestantes <= 30) {
                    $estadoContrato = 'Por vencer';
                }
            } else {
                $estadoContrato = 'Indefinido';
            }

            $contratoData = [
                'id' => $contratoActual->id,
                'localCodigo' => $contratoActual->local?->codigo,
                'localNombre' => $contratoActual->local?->nombre,
                'tipoRelacion' => $contratoActual->tipo_relacion,
                'habitaLocal' => (bool) $contratoActual->habita_local,
                'responsablePago' => (bool) $contratoActual->responsable_pago,
                'fechaInicio' => $contratoActual->fecha_inicio?->format('Y-m-d'),
                'fechaFin' => $contratoActual->fecha_fin?->format('Y-m-d'),
                'diasRestantes' => $diasRestantes,
                'estado' => $estadoContrato,
            ];
        }

        // Pagos e historial
        $pagos = Pago::with(['local', 'recibo'])
            ->where(function ($query) use ($user, $localIds) {
                $query->where('residente_id', $user->id)
                    ->orWhereIn('local_id', $localIds);
            })
            ->orderByDesc('fecha_pago')
            ->orderByDesc('id')
            ->limit(10)
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'localNombre' => $p->local?->nombre ?? $p->local?->codigo ?? 'Local',
                'monto' => (float) $p->monto,
                'fechaPago' => $p->fecha_pago?->format('Y-m-d'),
                'estado' => $p->estado,
                'comprobanteUrl' => $p->comprobante_url,
                'motivoRechazo' => $p->motivo_rechazo,
                'reciboFolio' => $p->recibo?->folio,
                'notas' => $p->notas,
            ]);

        // Cargos pendientes
        $cargos = Cargo::with('cuota')
            ->whereIn('local_id', $localIds)
            ->where('cancelado', false)
            ->orderBy('fecha_vencimiento')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'concepto' => $c->concepto,
                'periodo' => $c->periodo,
                'monto' => (float) $c->monto,
                'fechaVencimiento' => $c->fecha_vencimiento?->format('Y-m-d'),
                'cuotaNombre' => $c->cuota?->nombre,
            ]);

        // Incidencias del locatario
        $incidencias = Incidencia::with(['categoria', 'local', 'areaComun'])
            ->where('usuario_id', $user->id)
            ->latest('fecha_reporte')
            ->limit(10)
            ->get()
            ->map(fn ($i) => [
                'id' => $i->id,
                'titulo' => $i->titulo,
                'descripcion' => $i->descripcion,
                'categoria' => $i->categoria?->nombre,
                'lugar' => $i->local ? "Local {$i->local->codigo}" : ($i->areaComun?->nombre ?? 'Área común'),
                'prioridad' => $i->prioridad,
                'estado' => $i->estado,
                'fechaReporte' => $i->fecha_reporte?->format('Y-m-d H:i'),
                'comentario' => $i->comentario,
            ]);

        // Reservaciones del locatario
        $reservaciones = Reservacion::with('areaComun')
            ->where('usuario_id', $user->id)
            ->orderByDesc('fecha')
            ->orderBy('hora_inicio')
            ->limit(10)
            ->get()
            ->map(fn ($r) => [
                'id' => $r->id,
                'areaComun' => $r->areaComun?->nombre,
                'fecha' => $r->fecha?->format('Y-m-d'),
                'horaInicio' => substr($r->hora_inicio, 0, 5),
                'horaFin' => substr($r->hora_fin, 0, 5),
                'numAsistentes' => $r->num_asistentes,
                'motivo' => $r->motivo,
                'estado' => $r->estado,
                'motivoRechazo' => $r->motivo_rechazo,
            ]);

        // Avisos vigentes para locatarios
        $avisos = Aviso::vigentes()
            ->whereIn('dirigido_a', ['todos', 'locatarios'])
            ->orderByDesc('fijado')
            ->orderByDesc('fecha_publicacion')
            ->limit(5)
            ->get()
            ->map(fn ($a) => [
                'id' => $a->id,
                'titulo' => $a->titulo,
                'contenido' => $a->contenido,
                'tipo' => $a->tipo,
                'fechaPublicacion' => $a->fecha_publicacion?->format('Y-m-d'),
                'fechaEvento' => $a->fecha_evento?->format('Y-m-d H:i'),
                'fijado' => (bool) $a->fijado,
            ]);

        // Mensajería
        $mensajesNoLeidos = Mensaje::where('receptor_id', $user->id)->where('leido', false)->count();

        // Catálogos para creación rápida
        $categoriasIncidencia = CategoriaIncidencia::where('activa', true)
            ->orderBy('nombre')
            ->get(['id', 'nombre'])
            ->map(fn ($c) => ['value' => (string) $c->id, 'label' => $c->nombre]);

        $areasComunes = AreaComun::where('reservable', true)
            ->orderBy('nombre')
            ->get(['id', 'nombre', 'capacidad', 'hora_apertura', 'hora_cierre'])
            ->map(fn ($a) => [
                'value' => (string) $a->id,
                'label' => $a->nombre . ($a->capacidad ? " (Capacidad: {$a->capacidad})" : ''),
                'horaApertura' => $a->hora_apertura ? substr($a->hora_apertura, 0, 5) : null,
                'horaCierre' => $a->hora_cierre ? substr($a->hora_cierre, 0, 5) : null,
            ]);

        $localesOpciones = $locales->map(fn ($l) => [
            'value' => (string) $l->id,
            'label' => "{$l->codigo} - {$l->nombre}",
        ]);

        return Inertia::render('features/locatarios/dashboard', [
            'local' => $localData,
            'contrato' => $contratoData,
            'pagos' => $pagos,
            'cargos' => $cargos,
            'totalAdeudo' => (float) $cargos->sum('monto'),
            'incidencias' => $incidencias,
            'reservaciones' => $reservaciones,
            'avisos' => $avisos,
            'mensajesNoLeidos' => $mensajesNoLeidos,
            'catalogos' => [
                'categoriasIncidencia' => $categoriasIncidencia,
                'areasComunes' => $areasComunes,
                'locales' => $localesOpciones,
            ],
        ]);
    }
}

