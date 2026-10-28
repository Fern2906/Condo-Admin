<?php

use App\Http\Controllers\AreaComunController;
use App\Http\Controllers\AvisoController;
use App\Http\Controllers\ContratoController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LocalController;
use App\Http\Controllers\MensajeController;
use App\Http\Controllers\PagosController;
use App\Http\Controllers\ReportesController;
use App\Http\Controllers\ReservacionController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\IncidenciasController;
use App\Http\Controllers\CategoriaIncidenciaController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::delete('locales', [LocalController::class, 'destroyMany'])->name('locales.destroy-many');
    Route::patch('locales/estado', [LocalController::class, 'updateStatus'])->name('locales.update-status');
    Route::resource('locales', LocalController::class)
        ->only(['index', 'store', 'update', 'destroy'])
        ->parameters(['locales' => 'local']);

    Route::delete('users', [UserController::class, 'destroyMany'])->name('users.destroy-many');
    Route::patch('users/estado', [UserController::class, 'updateStatus'])->name('users.update-status');
    Route::resource('users', UserController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    // Reservaciones y Áreas Comunes
    Route::delete('reservaciones', [ReservacionController::class, 'destroyMany'])->name('reservaciones.destroy-many');
    Route::patch('reservaciones/estado', [ReservacionController::class, 'updateStatus'])->name('reservaciones.update-status');
    Route::resource('reservaciones', ReservacionController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    Route::resource('areas-comunes', AreaComunController::class)
        ->only(['store', 'update', 'destroy'])
        ->parameters(['areas-comunes' => 'area_comun']);

    /// Incidencias
    Route::delete('incidencias', [IncidenciasController::class, 'destroyMany'])->name('incidencias.destroy-many');
    Route::patch('incidencias/estado', [IncidenciasController::class, 'updateStatus'])->name('incidencias.update-status');
    Route::resource('incidencias', IncidenciasController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    // Categorías de incidencia (se gestionan desde la misma vista, como áreas comunes en reservaciones)
    Route::delete('categorias-incidencia', [CategoriaIncidenciaController::class, 'destroyMany'])->name('categorias-incidencia.destroy-many');
    Route::patch('categorias-incidencia/estado', [CategoriaIncidenciaController::class, 'updateStatus'])->name('categorias-incidencia.update-status');
    Route::resource('categorias-incidencia', CategoriaIncidenciaController::class)
        ->only(['index', 'store', 'update', 'destroy'])
    ->parameters(['categorias-incidencia' => 'categoria']);

    // Avisos
    Route::delete('avisos', [AvisoController::class, 'destroyMany'])->name('avisos.destroy-many');
    Route::patch('avisos/estado', [AvisoController::class, 'updateStatus'])->name('avisos.update-status');
    Route::resource('avisos', AvisoController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    // Contratos (registros de residente_local)
    Route::delete('contratos', [ContratoController::class, 'destroyMany'])->name('contratos.destroy-many');
    Route::resource('contratos', ContratoController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    // Cuotas y Pagos
    Route::delete('pagos', [PagosController::class, 'destroyMany'])->name('pagos.destroy-many');
    Route::patch('pagos/estado', [PagosController::class, 'updateStatus'])->name('pagos.update-status');
    Route::resource('pagos', PagosController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    // Reportes y Estadísticas
    Route::get('reportes', [ReportesController::class, 'index'])->name('reportes.index');

    // Mensajes y Chat en Vivo (WebSockets)
    Route::get('mensajes', [MensajeController::class, 'index'])->name('mensajes.index');
    Route::post('mensajes', [MensajeController::class, 'store'])->name('mensajes.store');
    Route::post('mensajes/leido', [MensajeController::class, 'markAsRead'])->name('mensajes.read');
    Route::delete('mensajes/{mensaje}', [MensajeController::class, 'destroy'])->name('mensajes.destroy');

});

require __DIR__.'/settings.php';
