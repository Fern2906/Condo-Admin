<?php

namespace Database\Seeders;

use App\Models\Mensaje;
use App\Models\Solicitud;
use App\Models\User;
use Illuminate\Database\Seeder;

class MensajesSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'test@example.com')->first() ?? User::first();
        $residentes = User::where('id', '!=', $admin->id)->take(3)->get();
        $solicitud = Solicitud::first();

        if (! $admin || $residentes->isEmpty()) {
            return;
        }

        foreach ($residentes as $index => $residente) {
            // Mensaje del residente al admin
            Mensaje::create([
                'emisor_id' => $residente->id,
                'receptor_id' => $admin->id,
                'solicitud_id' => $index === 0 && $solicitud ? $solicitud->id : null,
                'mensaje' => "Hola administración, ¿tienen novedades sobre los horarios de carga para esta semana?",
                'leido' => true,
                'created_at' => now()->subHours(4),
            ]);

            // Respuesta del admin al residente
            Mensaje::create([
                'emisor_id' => $admin->id,
                'receptor_id' => $residente->id,
                'solicitud_id' => $index === 0 && $solicitud ? $solicitud->id : null,
                'mensaje' => "Hola {$residente->name}, el horario de carga permitido es de 07:00 a 11:00 hrs y de 15:00 a 18:00 hrs.",
                'leido' => true,
                'created_at' => now()->subHours(2),
            ]);

            // Mensaje reciente
            Mensaje::create([
                'emisor_id' => $residente->id,
                'receptor_id' => $admin->id,
                'mensaje' => "Excelente, muchas gracias por la pronta respuesta.",
                'leido' => false,
                'created_at' => now()->subMinutes(15),
            ]);
        }
    }
}

