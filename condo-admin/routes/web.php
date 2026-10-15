<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
    Route::inertia('users', 'userList')->name('userList');
    Route::inertia('locales', 'locales')->name('locales');
});

require __DIR__.'/settings.php';
