<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('solicitudes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('local_id')->nullable()->constrained('locales')->nullOnDelete();
            $table->enum('tipo', ['queja', 'sugerencia', 'consulta', 'tramite']);
            $table->string('asunto', 150);
            $table->text('mensaje');
            $table->enum('estado', ['pendiente', 'en_revision', 'atendida', 'cerrada'])->default('pendiente');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('solicitudes');
    }
};
