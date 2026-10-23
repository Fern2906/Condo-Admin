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
    }
}
