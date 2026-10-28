<?php

namespace App\Http\Controllers;

use App\Models\Aviso;
use App\Models\Incidencia;
use App\Models\Local;
use App\Models\Pago;
use App\Models\Reservacion;
use App\Models\ResidenteLocal;
use App\Models\Solicitud;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    /**
     * Mostrar el panel de administración con el resumen del condominio.
     */
    public function __invoke(): Response
    {
        $reservacionesHoy = Reservacion::query()
            ->whereDate('fecha', today())
            ->whereIn('estado', ['pendiente', 'aprobada']);

        $contratosPorVencer = ResidenteLocal::query()
            ->whereNotNull('fecha_fin')
            ->whereBetween('fecha_fin', [today(), today()->addDays(30)])
            ->count();

        $contratosVencidos = ResidenteLocal::query()
            ->whereNotNull('fecha_fin')
            ->where('fecha_fin', '<', today())
            ->count();

        return Inertia::render('features/dashboard/index', [
            'stats' => [
                'localesTotal' => Local::count(),
                'localesOcupados' => Local::where('estado', 'Ocupado')->count(),
                'localesDisponibles' => Local::where('estado', 'Disponible')->count(),
                'incidenciasAbiertas' => Incidencia::abiertas()->count(),
                'incidenciasSinAtender' => Incidencia::where('estado', 'abierta')->count(),
                'reservacionesHoy' => (clone $reservacionesHoy)->count(),
                'reservacionesHoyAprobadas' => (clone $reservacionesHoy)->where('estado', 'aprobada')->count(),
                'avisosVigentes' => Aviso::vigentes()->count(),
                'solicitudesPendientes' => Solicitud::where('estado', 'pendiente')->count(),
                'contratosTotal' => ResidenteLocal::count(),
                'contratosPorVencer' => $contratosPorVencer,
                'contratosVencidos' => $contratosVencidos,
                'pagosPendientes' => Pago::where('estado', 'pendiente')->count(),
            ],
        ]);
    }
}
