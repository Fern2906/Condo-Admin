<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('incidencias', function (Blueprint $table) {
            $table->id();
            $table->string('titulo', 120);
            $table->text('descripcion');
            $table->foreignId('categoria_id')->constrained('categorias_incidencia')->restrictOnDelete();
            $table->foreignId('local_id')->nullable()->constrained('locales')->nullOnDelete();
            $table->foreignId('area_comun_id')->nullable()->constrained('areas_comunes')->nullOnDelete();
            $table->enum('prioridad', ['baja', 'media', 'alta', 'urgente'])->default('media');
            $table->enum('estado', ['abierta', 'asignada', 'en_proceso', 'resuelta', 'cerrada', 'cancelada'])->default('abierta');
            $table->text('comentario')->nullable();
            $table->foreignId('usuario_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('admin_id')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('fecha_reporte')->useCurrent();
            $table->dateTime('fecha_asignacion')->nullable();
            $table->dateTime('fecha_resolucion')->nullable();
            $table->decimal('costo_reparacion', 10, 2)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incidencias');
    }
};
