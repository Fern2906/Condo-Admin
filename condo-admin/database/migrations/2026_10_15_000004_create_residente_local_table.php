<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('residente_local', function (Blueprint $table) {
            // Relaciona al locatario/propietario (users) con su local.
            // En la vista de locales: tenantName/tenantMail/tenantPhone salen de users
            // y contractEnd sale de fecha_fin.
            $table->id();
            $table->foreignId('residente_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('local_id')->constrained('locales')->restrictOnDelete();
            $table->enum('tipo_relacion', ['propietario', 'locatario', 'otro'])->default('locatario');
            $table->boolean('habita_local')->default(false);
            $table->boolean('responsable_pago')->default(true);
            $table->date('fecha_inicio');
            $table->date('fecha_fin')->nullable();                      // contractEnd
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('residente_local');
    }
};
