<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservaciones', function (Blueprint $table) {
            $table->id();
            $table->foreignId('area_comun_id')->constrained('areas_comunes')->restrictOnDelete();
            $table->foreignId('usuario_id')->constrained('users')->restrictOnDelete();
            $table->date('fecha');                        // agregada: el diagrama no tenía fecha
            $table->time('hora_inicio');
            $table->time('hora_fin');
            $table->unsignedSmallInteger('num_asistentes')->nullable();
            $table->string('motivo', 150)->nullable();
            $table->enum('estado', ['pendiente', 'aprobada', 'rechazada', 'cancelada'])->default('pendiente');
            $table->foreignId('admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('motivo_rechazo', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservaciones');
    }
};
