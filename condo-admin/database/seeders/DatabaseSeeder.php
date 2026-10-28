<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Crea al administrador test@example.com (contraseña: password),
        // los roles y los datos de demostración del condominio.
        $this->call(CondominioSeeder::class);

        // Áreas comunes completas y reservaciones de ejemplo.
        $this->call(ReservacionesSeeder::class);

        // Cuotas, cargos y pagos de ejemplo con los locales y usuarios existentes.
        $this->call(PagosSeeder::class);
    }
}
