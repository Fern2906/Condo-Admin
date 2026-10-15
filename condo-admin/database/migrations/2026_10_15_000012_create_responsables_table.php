<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('responsables', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 120);
            $table->enum('tipo', ['interno', 'externo']);
            $table->string('especialidad', 80)->nullable();
            $table->string('empresa', 120)->nullable();
            $table->string('telefono', 20)->nullable();
            $table->string('email', 120)->nullable();
            $table->foreignId('usuario_id')->nullable()->unique()->constrained('users')->nullOnDelete();
            $table->boolean('activo')->default(true);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('responsables');
    }
};
