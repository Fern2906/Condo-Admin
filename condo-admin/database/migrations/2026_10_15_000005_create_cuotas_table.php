<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cuotas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 80);
            $table->enum('tipo', ['ordinaria', 'extraordinaria', 'renta', 'multa', 'otro']);
            $table->enum('periodicidad', ['unica', 'mensual', 'bimestral', 'trimestral', 'semestral', 'anual']);
            $table->decimal('monto', 10, 2);
            // OJO: el diagrama dice "date"; si es el día del mes (1-31), conviene:
            // $table->unsignedTinyInteger('dia_vencimiento');
            $table->date('dia_vencimiento');
            $table->string('descripcion', 255)->nullable();
            $table->boolean('activa')->default(true);
            $table->foreignId('creado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cuotas');
    }
};
