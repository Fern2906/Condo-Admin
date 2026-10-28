<?php

namespace Database\Seeders;

use App\Models\Cargo;
use App\Models\Cuota;
use App\Models\Local;
use App\Models\Pago;
use App\Models\Recibo;
use App\Models\User;
use Illuminate\Database\Seeder;

class PagosSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'test@example.com')->first() ?? User::first();
        if (! $admin) {
            return;
        }

        // 1. Crear Cuotas base
        $cuotaMantenimiento = Cuota::firstOrCreate(['nombre' => 'Mantenimiento General'], [
            'tipo' => 'ordinaria',
            'periodicidad' => 'mensual',
            'monto' => 2500.00,
            'dia_vencimiento' => now()->startOfMonth()->addDays(4)->toDateString(),
            'descripcion' => 'Mantenimiento de elevadores, áreas comunes e iluminación',
            'activa' => true,
            'creado_por' => $admin->id,
        ]);

        $cuotaSeguridad = Cuota::firstOrCreate(['nombre' => 'Vigilancia y Seguridad'], [
            'tipo' => 'ordinaria',
            'periodicidad' => 'mensual',
            'monto' => 1200.00,
            'dia_vencimiento' => now()->startOfMonth()->addDays(9)->toDateString(),
            'descripcion' => 'Servicio de vigilancia 24/7 y circuito cerrado',
            'activa' => true,
            'creado_por' => $admin->id,
        ]);

        $cuotaExtraordinaria = Cuota::firstOrCreate(['nombre' => 'Fondo de Impermeabilización'], [
            'tipo' => 'extraordinaria',
            'periodicidad' => 'unica',
            'monto' => 3500.00,
            'dia_vencimiento' => now()->addDays(15)->toDateString(),
            'descripcion' => 'Reparación e impermeabilización de techos y azoteas',
            'activa' => true,
            'creado_por' => $admin->id,
        ]);

        // 2. Obtener locales existentes con sus locatarios
        $locales = Local::with('locatario.residente')->get();
        if ($locales->isEmpty()) {
            return;
        }

        $periodoActual = now()->format('Y-m');

        foreach ($locales as $index => $local) {
            $residente = $local->locatario?->residente ?? $admin;

            // Generar Cargo mensual
            $montoCargo = (float) ($local->cuota_mantenimiento > 0 ? $local->cuota_mantenimiento : $cuotaMantenimiento->monto);
            $cargo = Cargo::firstOrCreate(
                [
                    'local_id' => $local->id,
                    'cuota_id' => $cuotaMantenimiento->id,
                    'periodo' => $periodoActual,
                ],
                [
                    'concepto' => "Mantenimiento {$periodoActual} - {$local->codigo}",
                    'monto' => $montoCargo,
                    'fecha_emision' => now()->startOfMonth()->toDateString(),
                    'fecha_vencimiento' => now()->startOfMonth()->addDays(10)->toDateString(),
                    'cancelado' => false,
                ]
            );

            // Variedad de estados para los pagos
            if ($index % 3 === 0) {
                // Pago VALIDADO
                $pago = Pago::create([
                    'local_id' => $local->id,
                    'residente_id' => $residente->id,
                    'monto' => $montoCargo,
                    'fecha_pago' => now()->subDays(rand(1, 10))->toDateString(),
                    'comprobante_url' => 'https://ejemplo.com/comprobantes/transf-'.rand(10000, 99999).'.pdf',
                    'estado' => 'validado',
                    'registrado_por' => $residente->id,
                    'validado_por' => $admin->id,
                    'fecha_validacion' => now()->subDays(rand(0, 2)),
                    'notas' => 'Transferencia interbancaria SPEI liquidada',
                ]);

                // Asignar al cargo y crear Recibo
                $pago->cargos()->attach($cargo->id, ['monto_aplicado' => $montoCargo]);

                Recibo::create([
                    'pago_id' => $pago->id,
                    'folio' => 'REC-'.now()->format('Ym').'-'.str_pad((string) $pago->id, 4, '0', STR_PAD_LEFT),
                    'fecha_emision' => $pago->fecha_validacion ?? now(),
                    'emitido_por' => $admin->id,
                    'cancelado' => false,
                ]);
            } elseif ($index % 3 === 1) {
                // Pago PENDIENTE
                $pago = Pago::create([
                    'local_id' => $local->id,
                    'residente_id' => $residente->id,
                    'monto' => $montoCargo,
                    'fecha_pago' => now()->toDateString(),
                    'comprobante_url' => 'https://ejemplo.com/comprobantes/deposito-'.rand(10000, 99999).'.jpg',
                    'estado' => 'pendiente',
                    'registrado_por' => $residente->id,
                    'notas' => 'Ficha de depósito en ventanilla bancaria por conciliar',
                ]);

                $pago->cargos()->attach($cargo->id, ['monto_aplicado' => $montoCargo]);
            } else {
                // Pago RECHAZADO
                Pago::create([
                    'local_id' => $local->id,
                    'residente_id' => $residente->id,
                    'monto' => $montoCargo,
                    'fecha_pago' => now()->subDays(5)->toDateString(),
                    'comprobante_url' => 'https://ejemplo.com/comprobantes/error-'.rand(10000, 99999).'.png',
                    'estado' => 'rechazado',
                    'registrado_por' => $residente->id,
                    'motivo_rechazo' => 'La referencia bancaria no coincide con el número de local asignado',
                    'notas' => 'Favor de volver a subir el comprobante legible con su folio de local',
                ]);
            }
        }
    }
}

