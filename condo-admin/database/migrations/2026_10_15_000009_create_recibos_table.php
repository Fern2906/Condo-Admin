<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recibos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pago_id')->unique()->constrained('pagos')->restrictOnDelete();
            $table->string('folio', 20)->unique();
            $table->dateTime('fecha_emision');
            $table->string('archivo_url', 255)->nullable();
            $table->foreignId('emitido_por')->constrained('users')->restrictOnDelete();
            $table->boolean('cancelado')->default(false);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recibos');
    }
};
