<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * La tabla "users" la crea Laravel (0001_01_01_000000_create_users_table.php)
 * y la usan Fortify, las passkeys, las sesiones y el modelo User.
 * Aquí solo se le agregan las columnas del condominio que estaban en "usuarios".
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Nullable porque el registro público (Fortify) no asigna rol
            $table->foreignId('rol_id')->nullable()->after('id')
                ->constrained('roles')->restrictOnDelete();

            // Mismos nombres que envía el formulario de registro (auth/register.tsx)
            $table->after('email', function (Blueprint $table) {
                $table->string('telefono', 20)->nullable();
                $table->string('telefono_alterno', 20)->nullable();
                $table->string('rfc', 13)->nullable();
                $table->string('contacto_emergencia', 120)->nullable();
                $table->string('telefono_emergencia', 20)->nullable();
            });

            $table->boolean('activo')->default(true)->after('remember_token');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('rol_id');
            $table->dropColumn([
                'telefono',
                'telefono_alterno',
                'rfc',
                'contacto_emergencia',
                'telefono_emergencia',
                'activo',
            ]);
        });
    }
};
