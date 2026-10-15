<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('areas_comunes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 80)->unique();
            $table->string('descripcion', 255)->nullable();
            $table->unsignedSmallInteger('capacidad')->nullable();
            $table->time('hora_apertura');
            $table->time('hora_cierre');
            $table->boolean('reservable')->default(true);
            $table->boolean('requiere_aprobacion')->default(false);
            $table->text('reglas')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('areas_comunes');
    }
};
