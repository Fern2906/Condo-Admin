<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pago_cargo', function (Blueprint $table) {
            $table->foreignId('pago_id')->constrained('pagos')->cascadeOnDelete();
            $table->foreignId('cargo_id')->constrained('cargos')->restrictOnDelete();
            $table->decimal('monto_aplicado', 10, 2);

            $table->primary(['pago_id', 'cargo_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pago_cargo');
    }
};
