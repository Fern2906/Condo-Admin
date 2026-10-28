<?php

namespace App\Http\Controllers;

use App\Models\AreaComun;
use App\Models\Cargo;
use App\Models\Incidencia;
use App\Models\Local;
use App\Models\Pago;
use App\Models\Reservacion;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportesController extends Controller
{
    /**
     * Muestra el panel general de reportes, estadísticas y análisis del condominio.
     */
    public function index(): Response
    {
        // 1. Métricas Financieras
        $totalRecaudado = (float) Pago::where('estado', 'validado')->sum('monto');
        $totalPendiente = (float) Pago::where('estado', 'pendiente')->sum('monto');
        $totalCargos = (float) Cargo::where('cancelado', false)->sum('monto');
        $pagosValidadosCount = Pago::where('estado', 'validado')->count();
        $pagosPendientesCount = Pago::where('estado', 'pendiente')->count();

        // 2. Ocupación
        $totalLocales = Local::count();
        $ocupados = Local::where('estado', 'Ocupado')->count();
        $disponibles = Local::where('estado', 'Disponible')->count();
        $mantenimiento = Local::where('estado', 'Mantenimiento')->count();
        $reservados = Local::where('estado', 'Reservado')->count();
        $tasaOcupacion = $totalLocales > 0 ? round(($ocupados / $totalLocales) * 100) : 0;
        $m2Total = (float) Local::sum('superficie_m2');
        $m2Ocupados = (float) Local::where('estado', 'Ocupado')->sum('superficie_m2');

        // Locales por Edificio
        $porEdificio = Local::selectRaw('edificio, count(*) as total')
            ->groupBy('edificio')
            ->pluck('total', 'edificio')
            ->toArray();

        // 3. Incidencias y Mantenimiento
        $incidenciasTotal = Incidencia::count();
        $incidenciasResueltas = Incidencia::whereIn('estado', ['resuelta', 'cerrada'])->count();
        $incidenciasAbiertas = Incidencia::whereIn('estado', ['abierta', 'asignada', 'en_proceso'])->count();
        $costoReparaciones = (float) Incidencia::sum('costo_reparacion');

        $incidenciasPorPrioridad = Incidencia::selectRaw('prioridad, count(*) as total')
            ->groupBy('prioridad')
            ->pluck('total', 'prioridad')
            ->toArray();

        // 4. Reservaciones
        $reservacionesTotal = Reservacion::count();
        $reservacionesAprobadas = Reservacion::where('estado', 'aprobada')->count();

        $areas = AreaComun::withCount('reservaciones')->get();
        $reservacionesPorArea = $areas->map(fn ($a) => [
            'nombre' => $a->nombre,
            'total' => $a->reservaciones_count,
        ])->toArray();

        // 5. Desglose detallado por local
        $locales = Local::with(['locatario.residente', 'pagos'])->get();
        $desgloseLocales = $locales->map(function (Local $l) {
            $pagado = (float) $l->pagos->where('estado', 'validado')->sum('monto');
            $pendiente = (float) $l->pagos->where('estado', 'pendiente')->sum('monto');

            return [
                'id' => $l->id,
                'codigo' => $l->codigo,
                'nombre' => $l->nombre,
                'edificio' => $l->edificio,
                'nivel' => $l->nivel ?? '—',
                'estado' => $l->estado,
                'superficie' => (float) $l->superficie_m2,
                'locatario' => $l->locatario?->residente?->name ?? 'Sin asignar',
                'rentaMensual' => (float) $l->renta_mensual,
                'cuotaMantenimiento' => (float) $l->cuota_mantenimiento,
                'totalPagado' => $pagado,
                'totalPendiente' => $pendiente,
                'totalPagos' => $l->pagos->count(),
            ];
        });

        return Inertia::render('features/reportes/index', [
            'stats' => [
                'financiero' => [
                    'totalRecaudado' => $totalRecaudado,
                    'totalPendiente' => $totalPendiente,
                    'totalCargos' => $totalCargos,
                    'pagosValidadosCount' => $pagosValidadosCount,
                    'pagosPendientesCount' => $pagosPendientesCount,
                ],
                'ocupacion' => [
                    'totalLocales' => $totalLocales,
                    'ocupados' => $ocupados,
                    'disponibles' => $disponibles,
                    'mantenimiento' => $mantenimiento,
                    'reservados' => $reservados,
                    'tasaOcupacion' => $tasaOcupacion,
                    'm2Total' => $m2Total,
                    'm2Ocupados' => $m2Ocupados,
                    'porEdificio' => $porEdificio,
                ],
                'incidencias' => [
                    'total' => $incidenciasTotal,
                    'resueltas' => $incidenciasResueltas,
                    'abiertas' => $incidenciasAbiertas,
                    'costoTotal' => $costoReparaciones,
                    'porPrioridad' => $incidenciasPorPrioridad,
                ],
                'reservaciones' => [
                    'total' => $reservacionesTotal,
                    'aprobadas' => $reservacionesAprobadas,
                    'porArea' => $reservacionesPorArea,
                ],
            ],
            'desgloseLocales' => $desgloseLocales,
        ]);
    }
}

