<?php

namespace Database\Seeders;

use App\Models\AreaComun;
use App\Models\Aviso;
use App\Models\CategoriaIncidencia;
use App\Models\Incidencia;
use App\Models\Local;
use App\Models\Reservacion;
use App\Models\Rol;
use App\Models\Solicitud;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\Hash;

/**
 * Datos de demostración del condominio. Son los mismos datos que antes
 * estaban escritos directamente en locales.tsx y userList.tsx.
 */
class CondominioSeeder extends Seeder
{
    public function run(): void
    {
        foreach ([Rol::ADMINISTRADOR, Rol::PROPIETARIO, Rol::LOCATARIO] as $nombre) {
            Rol::firstOrCreate(['nombre' => $nombre]);
        }

        $admin = User::firstOrCreate(['email' => 'test@example.com'], [
            'name' => 'Test User',
            'password' => Hash::make('password'),
        ]);
        $admin->forceFill([
            'rol_id' => Rol::where('nombre', Rol::ADMINISTRADOR)->value('id'),
            'email_verified_at' => $admin->email_verified_at ?? now(),
        ])->save();

        $rolLocatario = Rol::where('nombre', Rol::LOCATARIO)->value('id');

        foreach ($this->locales() as [$local, $locatario]) {
            $modelo = Local::updateOrCreate(['codigo' => $local['codigo']], $local);

            if ($locatario === null) {
                continue;
            }

            $residente = User::firstOrCreate(['email' => $locatario['email']], [
                'name' => $locatario['name'],
                'telefono' => $locatario['telefono'],
                'activo' => $locatario['activo'] ?? true,
                'password' => Hash::make('password'),
            ]);
            $residente->forceFill(['rol_id' => $rolLocatario, 'email_verified_at' => now()])->save();

            $modelo->asignarLocatario($residente, Date::parse($locatario['fin_contrato']));
        }

        $this->seedOperacion($admin);
    }

    /**
     * Incidencias, reservaciones, avisos y solicitudes para el dashboard.
     */
    private function seedOperacion(User $admin): void
    {
        if (Incidencia::exists()) {
            return;
        }

        $plomeria = CategoriaIncidencia::firstOrCreate(['nombre' => 'Plomería']);
        $electrico = CategoriaIncidencia::firstOrCreate(['nombre' => 'Eléctrico']);

        $terraza = AreaComun::firstOrCreate(['nombre' => 'Terraza'], [
            'capacidad' => 40, 'hora_apertura' => '08:00', 'hora_cierre' => '22:00',
        ]);
        $salon = AreaComun::firstOrCreate(['nombre' => 'Salón de usos múltiples'], [
            'capacidad' => 80, 'hora_apertura' => '09:00', 'hora_cierre' => '23:00', 'requiere_aprobacion' => true,
        ]);

        $local = Local::where('codigo', 'LC-01')->firstOrFail();
        $residenteId = $local->locatario()->value('residente_id') ?? $admin->id;

        Incidencia::create([
            'titulo' => 'Fuga en baño del local', 'descripcion' => 'Gotea el lavabo.',
            'categoria_id' => $plomeria->id, 'local_id' => $local->id, 'prioridad' => 'alta',
            'estado' => 'abierta', 'usuario_id' => $residenteId,
        ]);
        Incidencia::create([
            'titulo' => 'Lámpara fundida en terraza', 'descripcion' => 'No enciende la lámpara norte.',
            'categoria_id' => $electrico->id, 'area_comun_id' => $terraza->id,
            'estado' => 'abierta', 'usuario_id' => $residenteId,
        ]);
        Incidencia::create([
            'titulo' => 'Revisión de tablero eléctrico', 'descripcion' => 'Se bota la pastilla.',
            'categoria_id' => $electrico->id, 'local_id' => $local->id,
            'estado' => 'asignada', 'usuario_id' => $residenteId, 'admin_id' => $admin->id,
        ]);

        foreach ([['10:00', '12:00', 'aprobada'], ['13:00', '15:00', 'aprobada'], ['18:00', '21:00', 'pendiente']] as [$inicio, $fin, $estado]) {
            Reservacion::create([
                'area_comun_id' => $estado === 'pendiente' ? $salon->id : $terraza->id,
                'usuario_id' => $residenteId, 'fecha' => today(),
                'hora_inicio' => $inicio, 'hora_fin' => $fin, 'estado' => $estado,
            ]);
        }

        Aviso::create([
            'titulo' => 'Mantenimiento de elevadores', 'contenido' => 'El sábado se dará mantenimiento a los elevadores.',
            'tipo' => 'mantenimiento', 'publicado_por' => $admin->id,
        ]);
        Aviso::create([
            'titulo' => 'Junta de condóminos', 'contenido' => 'Junta ordinaria el último viernes del mes.',
            'tipo' => 'evento', 'publicado_por' => $admin->id,
        ]);

        Solicitud::create([
            'usuario_id' => $residenteId, 'local_id' => $local->id, 'tipo' => 'consulta',
            'asunto' => 'Horario de carga y descarga', 'mensaje' => '¿Cuál es el horario permitido?',
        ]);
    }

    /**
     * @return list<array{0: array<string, mixed>, 1: array<string, mixed>|null}>
     */
    private function locales(): array
    {
        $local = fn (string $codigo, string $nombre, string $giro, string $edificio, string $nivel, int $m2, int $renta, int $mant, string $estado) => [
            'codigo' => $codigo, 'nombre' => $nombre, 'giro' => $giro, 'edificio' => $edificio, 'nivel' => $nivel,
            'superficie_m2' => $m2, 'renta_mensual' => $renta, 'cuota_mantenimiento' => $mant, 'estado' => $estado,
        ];
        $locatario = fn (string $name, string $email, string $telefono, string $fin, bool $activo = true) => [
            'name' => $name, 'email' => $email, 'telefono' => $telefono, 'fin_contrato' => $fin, 'activo' => $activo,
        ];

        return [
            [$local('LC-01', 'Café & Bistro Gourmet', 'Gastronómico', 'Torre A', 'Planta Baja', 120, 28000, 3500, 'Ocupado'),
                $locatario('Carlos Mendoza', 'carlos.mendoza@email.com', '+52 55 1234 5678', '2027-08-31')],
            [$local('LC-02', 'Boutique Alta Moda', 'Comercial / Moda', 'Torre A', 'Planta Baja', 85, 21000, 2600, 'Ocupado'),
                $locatario('Ana Sofía Rivas', 'ana.rivas@email.com', '+52 55 8765 4321', '2026-12-15')],
            [$local('LC-03', 'Espacio Comercial 03', 'Comercial / Retail', 'Torre B', 'Planta Baja', 65, 17500, 2200, 'Disponible'), null],
            [$local('LC-04', 'Mini Market Express', 'Conveniencia', 'Torre C', 'Planta Baja', 95, 23000, 2900, 'Ocupado'),
                $locatario('Miguel Ángel Ruiz', 'miguel.ruiz@email.com', '+52 55 9876 1234', '2027-02-28', activo: false)],
            [$local('LC-05', 'Farmacia & Dermocosmética', 'Salud y Farmacia', 'Torre B', 'Planta Baja', 110, 26000, 3200, 'Ocupado'),
                $locatario('Elena Gómez', 'elena.gomez@email.com', '+52 55 4321 8765', '2026-11-30')],
            [$local('LC-06', 'Local en Renovación', 'Comercial', 'Plaza Central', 'Piso 1', 75, 19000, 2400, 'Mantenimiento'), null],
            [$local('LC-07', 'Estudio de Belleza y Spa', 'Servicios', 'Plaza Central', 'Piso 1', 90, 22500, 2800, 'Ocupado'),
                $locatario('Mariana Fuentes', 'mariana.fuentes@email.com', '+52 55 3344 5566', '2027-05-15')],
            [$local('LC-08', 'Isla Comercial Central', 'Kiosco / Accesorios', 'Plaza Central', 'Planta Baja', 30, 12000, 1500, 'Disponible'), null],
            [$local('LC-09', 'Consultorio Dental Especializado', 'Salud y Servicios', 'Torre C', 'Piso 1', 70, 18500, 2300, 'Reservado'),
                $locatario('Dr. Roberto Saldaña', 'roberto.saldana@email.com', '+52 55 6677 8899', '2026-09-30')],
            [$local('LC-10', 'Local Panorámico Terraza', 'Gastronómico / Bar', 'Torre A', 'Piso 2', 140, 35000, 4500, 'Disponible'), null],
        ];
    }
}
