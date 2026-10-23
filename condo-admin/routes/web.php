<?php

use App\Http\Controllers\AreaComunController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LocalController;
use App\Http\Controllers\ReservacionController;
use App\Http\Controllers\UserController;
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
});

require __DIR__.'/settings.php';
