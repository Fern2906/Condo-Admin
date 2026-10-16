<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documentos', function (Blueprint $table) {
            $table->id();
            $table->string('titulo', 150);
            $table->string('descripcion', 255)->nullable();
            $table->string('archivo_url', 255);
            $table->string('tipo_mime', 80)->nullable();
            $table->unsignedInteger('tamano_bytes')->nullable();
            $table->boolean('visible_residentes')->default(true);
            $table->foreignId('subido_por')->constrained('users')->restrictOnDelete();
            $table->dateTime('subido_en')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documentos');
    }
};
