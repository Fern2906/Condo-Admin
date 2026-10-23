<?php

namespace Database\Seeders;

use App\Models\AreaComun;
use App\Models\Reservacion;
use App\Models\User;
use Illuminate\Database\Seeder;

/**
 * Áreas comunes de demostración y reservaciones de ejemplo.
 * Complementa a CondominioSeeder: puede ejecutarse de forma independiente
 * o en conjunto con él (firstOrCreate protege contra duplicados).
 */
class ReservacionesSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedAreasComunesCompleto();
        $this->seedReservaciones();
    }

    private function seedAreasComunesCompleto(): void
    {
        $areas = [
            [
                'nombre'              => 'Terraza',
                'descripcion'         => 'Terraza panorámica con vista a la ciudad, ideal para eventos al aire libre.',
                'capacidad'           => 40,
                'hora_apertura'       => '08:00',
                'hora_cierre'         => '22:00',
                'reservable'          => true,
                'requiere_aprobacion' => false,
                'reglas'              => "No se permite música después de las 21:00.\nProhibido el acceso a menores sin acompañante.\nDejar el área limpia al terminar.",
            ],
            [
                'nombre'              => 'Salón de usos múltiples',
                'descripcion'         => 'Salón equipado con proyector, sonido y aire acondicionado. Capacidad para eventos privados.',
                'capacidad'           => 80,
                'hora_apertura'       => '09:00',
                'hora_cierre'         => '23:00',
                'reservable'          => true,
                'requiere_aprobacion' => true,
                'reglas'              => "Requiere depósito de garantía.\nNo se permiten eventos después de las 22:30.\nLimpieza a cargo del solicitante.",
            ],
            [
                'nombre'              => 'Alberca',
                'descripcion'         => 'Alberca climatizada con área de regaderas y vestidores.',
                'capacidad'           => 25,
                'hora_apertura'       => '07:00',
                'hora_cierre'         => '20:00',
                'reservable'          => true,
                'requiere_aprobacion' => false,
                'reglas'              => "Obligatorio ducharse antes de ingresar.\nNo se permite comida en el área de la alberca.\nMenores deben ir acompañados.",
            ],
            [
                'nombre'              => 'Gimnasio',
                'descripcion'         => 'Gimnasio equipado con cardio, pesas libres y máquinas.',
                'capacidad'           => 15,
                'hora_apertura'       => '06:00',
                'hora_cierre'         => '22:00',
                'reservable'          => false,
                'requiere_aprobacion' => false,
                'reglas'              => "Uso de toalla obligatorio.\nLimpiar equipos después de usarlos.\nRopa deportiva requerida.",
            ],
            [
                'nombre'              => 'Sala de juntas',
                'descripcion'         => 'Sala de reuniones con capacidad para 12 personas, pizarrón y pantalla.',
                'capacidad'           => 12,
                'hora_apertura'       => '08:00',
                'hora_cierre'         => '20:00',
                'reservable'          => true,
                'requiere_aprobacion' => true,
                'reglas'              => "Reservaciones máximo de 3 horas.\nDejar equipo en orden.\nNo se permiten alimentos.",
            ],
            [
                'nombre'              => 'Jardín central',
                'descripcion'         => 'Área verde con asadores y mesas para reuniones al aire libre.',
                'capacidad'           => 60,
                'hora_apertura'       => '09:00',
                'hora_cierre'         => '21:00',
                'reservable'          => true,
                'requiere_aprobacion' => false,
                'reglas'              => "Los asadores deben quedar limpios.\nNo se permiten fogatas o flamas abiertas.\nRespetar a otros usuarios del espacio.",
            ],
        ];

        foreach ($areas as $datos) {
            AreaComun::firstOrCreate(['nombre' => $datos['nombre']], $datos);
        }
    }

    private function seedReservaciones(): void
    {
        if (Reservacion::exists()) {
            return;
        }

        $admin = User::where('email', 'test@example.com')->first();
        if (! $admin) {
            return;
        }

        $terraza = AreaComun::where('nombre', 'Terraza')->first();
        $salon   = AreaComun::where('nombre', 'Salón de usos múltiples')->first();
        $alberca = AreaComun::where('nombre', 'Alberca')->first();
        $jardin  = AreaComun::where('nombre', 'Jardín central')->first();

        if (! $terraza || ! $salon || ! $alberca || ! $jardin) {
            return;
        }

        $reservaciones = [
            // Hoy
            ['area_comun_id' => $terraza->id,  'fecha' => today(),              'hora_inicio' => '10:00', 'hora_fin' => '12:00', 'estado' => 'aprobada',  'num_asistentes' => 20, 'motivo' => 'Reunión de socios'],
            ['area_comun_id' => $salon->id,    'fecha' => today(),              'hora_inicio' => '14:00', 'hora_fin' => '17:00', 'estado' => 'pendiente', 'num_asistentes' => 50, 'motivo' => 'Conferencia de negocios'],
            ['area_comun_id' => $alberca->id,  'fecha' => today(),              'hora_inicio' => '08:00', 'hora_fin' => '10:00', 'estado' => 'aprobada',  'num_asistentes' => 10, 'motivo' => null],

            // Mañana
            ['area_comun_id' => $terraza->id,  'fecha' => today()->addDay(),    'hora_inicio' => '18:00', 'hora_fin' => '21:00', 'estado' => 'aprobada',  'num_asistentes' => 30, 'motivo' => 'Cumpleaños'],
            ['area_comun_id' => $jardin->id,   'fecha' => today()->addDay(),    'hora_inicio' => '12:00', 'hora_fin' => '15:00', 'estado' => 'pendiente', 'num_asistentes' => 15, 'motivo' => 'Carne asada familiar'],

            // Ayer (historial)
            ['area_comun_id' => $salon->id,    'fecha' => today()->subDay(),    'hora_inicio' => '10:00', 'hora_fin' => '13:00', 'estado' => 'aprobada',  'num_asistentes' => 40, 'motivo' => 'Asamblea condóminos'],
            ['area_comun_id' => $terraza->id,  'fecha' => today()->subDay(),    'hora_inicio' => '16:00', 'hora_fin' => '18:00', 'estado' => 'rechazada', 'num_asistentes' => 5,  'motivo' => 'Sesión fotográfica', 'motivo_rechazo' => 'Área no disponible para uso comercial.'],
            ['area_comun_id' => $alberca->id,  'fecha' => today()->subDays(3),  'hora_inicio' => '09:00', 'hora_fin' => '11:00', 'estado' => 'cancelada', 'num_asistentes' => 8,  'motivo' => 'Clase de natación'],
        ];

        foreach ($reservaciones as $datos) {
            Reservacion::create([
                ...$datos,
                'usuario_id' => $admin->id,
                'admin_id'   => in_array($datos['estado'], ['aprobada', 'rechazada']) ? $admin->id : null,
            ]);
        }
    }
}
