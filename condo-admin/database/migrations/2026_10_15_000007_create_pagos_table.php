<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pagos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('local_id')->constrained('locales')->restrictOnDelete();
            $table->foreignId('residente_id')->nullable()->constrained('users')->nullOnDelete();
            $table->decimal('monto', 10, 2);
            $table->date('fecha_pago');
            $table->string('comprobante_url', 255)->nullable();
            $table->enum('estado', ['pendiente', 'validado', 'rechazado'])->default('pendiente');
            $table->foreignId('registrado_por')->constrained('users')->restrictOnDelete();
            $table->foreignId('validado_por')->nullable()->constrained('users')->nullOnDelete();
            $table->dateTime('fecha_validacion')->nullable();
            $table->string('motivo_rechazo', 255)->nullable();
            $table->string('notas', 255)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pagos');
    }
};
