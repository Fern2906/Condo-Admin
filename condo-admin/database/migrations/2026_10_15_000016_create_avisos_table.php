<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('avisos', function (Blueprint $table) {
            $table->id();
            $table->string('titulo', 150);
            $table->text('contenido');
            $table->enum('tipo', ['general', 'mantenimiento', 'evento', 'urgente'])->default('general');
            $table->enum('dirigido_a', ['todos', 'propietarios', 'locatarios', 'administradores'])->default('todos');
            $table->dateTime('fecha_evento')->nullable();
            $table->dateTime('fecha_publicacion')->useCurrent();
            $table->dateTime('fecha_expiracion')->nullable();
            $table->boolean('fijado')->default(false);
            $table->foreignId('publicado_por')->constrained('users')->restrictOnDelete();
            $table->boolean('activo')->default(true);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('avisos');
    }
};
