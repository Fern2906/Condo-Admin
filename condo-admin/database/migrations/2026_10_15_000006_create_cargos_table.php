<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cargos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('local_id')->constrained('locales')->restrictOnDelete();
            $table->foreignId('cuota_id')->constrained('cuotas')->restrictOnDelete();
            $table->char('periodo', 7)->comment('Formato AAAA-MM');
            $table->string('concepto', 120);
            $table->decimal('monto', 10, 2);
            $table->date('fecha_emision');
            $table->date('fecha_vencimiento');
            $table->boolean('cancelado')->default(false);
            $table->string('motivo_cancelacion', 255)->nullable();
            $table->timestamps();

            // Sugerencia: evitar cobrar dos veces la misma cuota en el mismo periodo
            // $table->unique(['local_id', 'cuota_id', 'periodo']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cargos');
    }
};
