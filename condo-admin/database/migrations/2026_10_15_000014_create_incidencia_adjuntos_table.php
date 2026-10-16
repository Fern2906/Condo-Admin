<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('incidencia_adjuntos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('incidencia_id')->constrained('incidencias')->cascadeOnDelete();
            $table->string('archivo_url', 255);
            $table->string('nombre_original', 150)->nullable();
            $table->foreignId('subido_por')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('subido_en')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incidencia_adjuntos');
    }
};
