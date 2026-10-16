<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('locales', function (Blueprint $table) {
            // Columnas alineadas con LocalData de resources/js/pages/locales.tsx
            $table->id();
            $table->string('codigo', 20)->unique();                     // code: "LC-01"
            $table->string('nombre', 150);                              // name: nombre / razón social
            $table->string('giro', 80)->nullable();                     // businessType: "Gastronómico"
            $table->string('edificio', 30);                             // building: "Torre A", "Plaza Central"
            $table->string('nivel', 30)->nullable();                    // level: "Planta Baja", "Piso 1"
            $table->decimal('superficie_m2', 8, 2)->nullable();         // area
            $table->decimal('renta_mensual', 10, 2)->default(0);        // monthlyRent
            $table->decimal('cuota_mantenimiento', 10, 2)->default(0);  // maintenanceFee
            $table->enum('estado', ['Disponible', 'Ocupado', 'Mantenimiento', 'Reservado'])
                ->default('Disponible');                                // status
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('locales');
    }
};
