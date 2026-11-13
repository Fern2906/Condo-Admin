<?php

namespace Tests\Feature;

use App\Models\Cargo;
use App\Models\Cuota;
use App\Models\Local;
use App\Models\Pago;
use App\Models\Recibo;
use App\Models\ResidenteLocal;
use App\Models\Rol;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PagosControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    private function usuario(string $rol = Rol::ADMINISTRADOR): User
    {
        $user = User::factory()->create();
        $user->forceFill(['rol_id' => Rol::firstOrCreate(['nombre' => $rol])->id])->save();

        return $user;
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(Local $local, array $overrides = []): array
    {
        return [
            'localId' => $local->id,
            'residenteId' => null,
            'monto' => 2500,
            'fechaPago' => '2026-11-01',
            'estado' => 'pendiente',
            'notas' => 'Mantenimiento noviembre',
            'comprobanteUrl' => '',
            'motivoRechazo' => '',
            ...$overrides,
        ];
    }

    private function locatarioDe(Local $local): User
    {
        $user = $this->usuario(Rol::LOCATARIO);
        ResidenteLocal::create([
            'residente_id' => $user->id, 'local_id' => $local->id, 'tipo_relacion' => 'locatario',
            'habita_local' => false, 'responsable_pago' => true, 'fecha_inicio' => '2026-01-01',
        ]);

        return $user;
    }

    private function cargo(Local $local, float $monto, string $vencimiento = '2026-11-10'): Cargo
    {
        $cuota = Cuota::firstOrCreate(
            ['nombre' => 'Mantenimiento'],
            ['tipo' => 'ordinaria', 'periodicidad' => 'mensual', 'monto' => $monto, 'dia_vencimiento' => '2026-10-10'],
        );

        return Cargo::create([
            'local_id' => $local->id, 'cuota_id' => $cuota->id, 'periodo' => substr($vencimiento, 0, 7),
            'concepto' => "Mantenimiento {$vencimiento}", 'monto' => $monto,
            'fecha_emision' => '2026-11-01', 'fecha_vencimiento' => $vencimiento,
        ]);
    }

    private function pago(Local $local, User $registradoPor, array $overrides = []): Pago
    {
        return Pago::create([
            'local_id' => $local->id,
            'monto' => 2500,
            'fecha_pago' => '2026-11-01',
            'estado' => 'pendiente',
            'registrado_por' => $registradoPor->id,
            ...$overrides,
        ]);
    }

    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get(route('pagos.index'))->assertRedirect(route('login'));
        $this->post(route('pagos.store'), [])->assertRedirect(route('login'));
    }

    public function test_index_lists_payments_newest_first_with_active_cuotas_only()
    {
        $admin = $this->usuario();
        $local = Local::factory()->create(['codigo' => 'LC-01']);
        $viejo = $this->pago($local, $admin, ['fecha_pago' => '2026-09-01']);
        $nuevo = $this->pago($local, $admin, ['fecha_pago' => '2026-11-01']);

        Cuota::create(['nombre' => 'Activa', 'tipo' => 'ordinaria', 'periodicidad' => 'mensual', 'monto' => 100, 'dia_vencimiento' => '2026-10-10']);
        Cuota::create(['nombre' => 'Inactiva', 'tipo' => 'ordinaria', 'periodicidad' => 'mensual', 'monto' => 100, 'dia_vencimiento' => '2026-10-10', 'activa' => false]);

        $this->actingAs($admin)
            ->get(route('pagos.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('features/pagos/index')
                ->has('pagos', 2)
                ->where('pagos.0.id', $nuevo->id)
                ->where('pagos.0.localCodigo', 'LC-01')
                ->where('pagos.0.residenteNombre', 'Sin residente')
                ->where('pagos.1.id', $viejo->id)
                ->has('cuotas', 1)
                ->where('cuotas.0.nombre', 'Activa')
            );
    }

    public function test_store_creates_a_pending_payment_without_a_receipt()
    {
        $admin = $this->usuario();
        $local = Local::factory()->create();

        $this->actingAs($admin)
            ->post(route('pagos.store'), $this->payload($local))
            ->assertRedirect(route('pagos.index'));

        $pago = Pago::sole();
        $this->assertSame('pendiente', $pago->estado);
        $this->assertSame($admin->id, $pago->registrado_por);
        $this->assertNull($pago->residente_id);
        $this->assertNull($pago->validado_por);
        $this->assertSame(0, Recibo::count());
    }

    public function test_store_as_validated_records_the_validator_and_issues_a_receipt()
    {
        $admin = $this->usuario();
        $local = Local::factory()->create();

        $this->actingAs($admin)
            ->post(route('pagos.store'), $this->payload($local, ['estado' => 'validado']))
            ->assertRedirect(route('pagos.index'));

        $pago = Pago::sole();
        $this->assertSame($admin->id, $pago->validado_por);
        $this->assertNotNull($pago->fecha_validacion);
        $this->assertSame($admin->id, $pago->recibo->emitido_por);
        $this->assertMatchesRegularExpression('/^REC-\d{8}-\d{4}$/', $pago->recibo->folio);
    }

    public function test_store_validates_required_fields_and_amount()
    {
        $admin = $this->usuario();
        $local = Local::factory()->create();

        $this->actingAs($admin)
            ->post(route('pagos.store'), $this->payload($local, ['localId' => 9999, 'monto' => 0, 'fechaPago' => 'no-es-fecha', 'estado' => 'pagado']))
            ->assertSessionHasErrors(['localId', 'monto', 'fechaPago', 'estado']);

        $this->assertSame(0, Pago::count());
    }

    public function test_update_to_validated_issues_a_single_receipt()
    {
        $admin = $this->usuario();
        $local = Local::factory()->create();
        $pago = $this->pago($local, $admin);

        $this->actingAs($admin)->put(route('pagos.update', $pago), $this->payload($local, ['estado' => 'validado']));
        $this->actingAs($admin)->put(route('pagos.update', $pago), $this->payload($local, ['estado' => 'validado', 'notas' => 'Editado']));

        $this->assertSame(1, Recibo::where('pago_id', $pago->id)->count());
        $this->assertSame('Editado', $pago->fresh()->notas);
    }

    public function test_bulk_status_validates_and_issues_receipts()
    {
        $admin = $this->usuario();
        $local = Local::factory()->create();
        $a = $this->pago($local, $admin);
        $b = $this->pago($local, $admin);

        $this->actingAs($admin)
            ->patch(route('pagos.update-status'), ['ids' => [$a->id, $b->id], 'estado' => 'validado'])
            ->assertRedirect(route('pagos.index'));

        $this->assertSame(['validado', 'validado'], Pago::orderBy('id')->pluck('estado')->all());
        $this->assertSame(2, Recibo::count());
    }

    public function test_bulk_status_reject_stores_the_reason()
    {
        $admin = $this->usuario();
        $pago = $this->pago(Local::factory()->create(), $admin);

        $this->actingAs($admin)
            ->patch(route('pagos.update-status'), ['ids' => [$pago->id], 'estado' => 'rechazado', 'motivoRechazo' => 'Comprobante ilegible']);

        $pago->refresh();
        $this->assertSame('rechazado', $pago->estado);
        $this->assertSame('Comprobante ilegible', $pago->motivo_rechazo);
    }

    public function test_destroy_removes_the_payment_its_receipt_and_its_charge_links()
    {
        $admin = $this->usuario();
        $local = Local::factory()->create();
        $cuota = Cuota::create(['nombre' => 'Mantenimiento', 'tipo' => 'ordinaria', 'periodicidad' => 'mensual', 'monto' => 2500, 'dia_vencimiento' => '2026-10-10']);
        $cargo = Cargo::create([
            'local_id' => $local->id, 'cuota_id' => $cuota->id, 'periodo' => '2026-11',
            'concepto' => 'Mantenimiento noviembre', 'monto' => 2500,
            'fecha_emision' => '2026-11-01', 'fecha_vencimiento' => '2026-11-10',
        ]);
        $pago = $this->pago($local, $admin);
        $pago->cargos()->attach($cargo->id, ['monto_aplicado' => 2500]);
        $this->actingAs($admin)->patch(route('pagos.update-status'), ['ids' => [$pago->id], 'estado' => 'validado']);

        $this->actingAs($admin)
            ->delete(route('pagos.destroy', $pago))
            ->assertRedirect(route('pagos.index'));

        $this->assertModelMissing($pago);
        $this->assertSame(0, Recibo::count());
        $this->assertDatabaseCount('pago_cargo', 0);
        $this->assertModelExists($cargo);
    }

    public function test_destroy_many_removes_payments_with_receipts()
    {
        $admin = $this->usuario();
        $local = Local::factory()->create();
        $a = $this->pago($local, $admin);
        $b = $this->pago($local, $admin);
        $this->actingAs($admin)->patch(route('pagos.update-status'), ['ids' => [$a->id], 'estado' => 'validado']);

        $this->actingAs($admin)
            ->delete(route('pagos.destroy-many'), ['ids' => [$a->id, $b->id]])
            ->assertRedirect(route('pagos.index'));

        $this->assertSame(0, Pago::count());
        $this->assertSame(0, Recibo::count());
    }

    public function test_only_administrators_can_manage_payments()
    {
        $admin = $this->usuario();
        $local = Local::factory()->create();
        $pago = $this->pago($local, $admin);

        foreach ([$this->locatarioDe($local), $this->usuario(Rol::PROPIETARIO), User::factory()->create()] as $user) {
            $this->actingAs($user)->get(route('pagos.index'))->assertForbidden();
            $this->actingAs($user)->post(route('pagos.store'), $this->payload($local, ['estado' => 'validado']))->assertForbidden();
            $this->actingAs($user)->put(route('pagos.update', $pago), $this->payload($local))->assertForbidden();
            $this->actingAs($user)->patch(route('pagos.update-status'), ['ids' => [$pago->id], 'estado' => 'validado'])->assertForbidden();
            $this->actingAs($user)->delete(route('pagos.destroy', $pago))->assertForbidden();
            $this->actingAs($user)->delete(route('pagos.destroy-many'), ['ids' => [$pago->id]])->assertForbidden();
        }

        $this->assertSame('pendiente', $pago->fresh()->estado);
        $this->assertSame(1, Pago::count());
    }

    public function test_tenant_reports_a_pending_payment_for_their_own_local()
    {
        $local = Local::factory()->create();
        $locatario = $this->locatarioDe($local);

        $this->actingAs($locatario)
            ->post(route('locatarios.pagos.store'), [
                'localId' => $local->id, 'monto' => 2500, 'fechaPago' => '2026-11-01',
                'estado' => 'validado', 'residenteId' => 999,
            ])
            ->assertRedirect(route('locatarios.dashboard'));

        $pago = Pago::sole();
        $this->assertSame('pendiente', $pago->estado);
        $this->assertSame($locatario->id, $pago->residente_id);
        $this->assertSame($locatario->id, $pago->registrado_por);
        $this->assertNull($pago->validado_por);
        $this->assertSame(0, Recibo::count());
    }

    public function test_tenant_cannot_report_a_payment_for_another_local()
    {
        $locatario = $this->locatarioDe(Local::factory()->create());
        $ajeno = Local::factory()->create();

        $this->actingAs($locatario)
            ->post(route('locatarios.pagos.store'), ['localId' => $ajeno->id, 'monto' => 2500, 'fechaPago' => '2026-11-01'])
            ->assertSessionHasErrors('localId');

        $this->assertSame(0, Pago::count());
    }

    public function test_tenant_debt_only_counts_what_validated_payments_have_not_covered()
    {
        $admin = $this->usuario();
        $local = Local::factory()->create();
        $locatario = $this->locatarioDe($local);
        $pagado = $this->cargo($local, 2500, '2026-10-10');
        $parcial = $this->cargo($local, 2500, '2026-11-10');
        $enRevision = $this->cargo($local, 1000, '2026-12-10');

        $this->pago($local, $admin, ['estado' => 'validado', 'monto' => 3500])
            ->cargos()->attach([$pagado->id => ['monto_aplicado' => 2500], $parcial->id => ['monto_aplicado' => 1000]]);
        $this->pago($local, $admin, ['estado' => 'pendiente', 'monto' => 1000])
            ->cargos()->attach($enRevision->id, ['monto_aplicado' => 1000]);

        $this->actingAs($locatario)
            ->get(route('locatarios.dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('totalAdeudo', 2500)
                ->has('cargos', 2)
                ->where('cargos.0.id', $parcial->id)
                ->where('cargos.0.saldo', 1500)
                ->where('cargos.1.id', $enRevision->id)
                ->where('cargos.1.saldo', 1000)
            );
    }

    public function test_store_applies_the_amount_to_charges_by_due_date()
    {
        $admin = $this->usuario();
        $local = Local::factory()->create();
        $posterior = $this->cargo($local, 2500, '2026-12-10');
        $anterior = $this->cargo($local, 2500, '2026-11-10');

        $this->actingAs($admin)
            ->post(route('pagos.store'), $this->payload($local, ['monto' => 3000, 'cargoIds' => [$posterior->id, $anterior->id]]))
            ->assertSessionHasNoErrors();

        $aplicado = Pago::sole()->cargos->pluck('pivot.monto_aplicado', 'id');
        $this->assertEquals(2500, $aplicado[$anterior->id]);
        $this->assertEquals(500, $aplicado[$posterior->id]);
    }

    public function test_store_rejects_charges_that_cannot_be_covered()
    {
        $admin = $this->usuario();
        $local = Local::factory()->create();
        $ajeno = $this->cargo(Local::factory()->create(), 2500);
        $cubierto = $this->cargo($local, 2500, '2026-10-10');
        $this->pago($local, $admin)->cargos()->attach($cubierto->id, ['monto_aplicado' => 2500]);
        $a = $this->cargo($local, 2500, '2026-11-10');
        $b = $this->cargo($local, 2500, '2026-12-10');

        $this->actingAs($admin)
            ->post(route('pagos.store'), $this->payload($local, ['cargoIds' => [$ajeno->id]]))
            ->assertSessionHasErrors('cargoIds.0');
        $this->actingAs($admin)
            ->post(route('pagos.store'), $this->payload($local, ['cargoIds' => [$cubierto->id]]))
            ->assertSessionHasErrors('cargoIds');
        $this->actingAs($admin)
            ->post(route('pagos.store'), $this->payload($local, ['monto' => 2500, 'cargoIds' => [$a->id, $b->id]]))
            ->assertSessionHasErrors('cargoIds');

        $this->assertSame(1, Pago::count());
    }

    public function test_leaving_validated_cancels_the_receipt_and_revalidating_restores_it()
    {
        $admin = $this->usuario();
        $local = Local::factory()->create();
        $cargo = $this->cargo($local, 2500);
        $pago = $this->pago($local, $admin);
        $pago->cargos()->attach($cargo->id, ['monto_aplicado' => 2500]);

        $this->actingAs($admin)->patch(route('pagos.update-status'), ['ids' => [$pago->id], 'estado' => 'validado']);
        $folio = $pago->fresh()->recibo->folio;

        $this->actingAs($admin)->patch(route('pagos.update-status'), ['ids' => [$pago->id], 'estado' => 'rechazado', 'motivoRechazo' => 'Monto incorrecto']);

        $this->assertTrue($pago->fresh()->recibo->cancelado);
        $this->assertNull($pago->fresh()->folioVigente());
        $this->assertDatabaseCount('pago_cargo', 0);

        $this->actingAs($admin)->patch(route('pagos.update-status'), ['ids' => [$pago->id], 'estado' => 'validado']);

        $recibo = $pago->fresh()->recibo;
        $this->assertFalse($recibo->cancelado);
        $this->assertSame($folio, $recibo->folio);
        $this->assertSame(1, Recibo::count());
    }

    public function test_validated_payment_keeps_its_local_amount_and_charges()
    {
        $admin = $this->usuario();
        $local = Local::factory()->create();
        $cargo = $this->cargo($local, 2500);
        $pago = $this->pago($local, $admin);
        $pago->cargos()->attach($cargo->id, ['monto_aplicado' => 2500]);
        $this->actingAs($admin)->patch(route('pagos.update-status'), ['ids' => [$pago->id], 'estado' => 'validado']);

        $this->actingAs($admin)
            ->put(route('pagos.update', $pago), $this->payload(Local::factory()->create(), ['estado' => 'validado', 'monto' => 1, 'cargoIds' => []]))
            ->assertSessionHasErrors(['localId', 'monto', 'cargoIds']);
        $this->assertEquals(2500, (float) $pago->fresh()->monto);

        $this->actingAs($admin)
            ->put(route('pagos.update', $pago), $this->payload($local, ['estado' => 'validado', 'cargoIds' => [$cargo->id], 'notas' => 'Solo notas']))
            ->assertSessionHasNoErrors();
        $this->assertSame('Solo notas', $pago->fresh()->notas);

        $this->actingAs($admin)
            ->put(route('pagos.update', $pago), $this->payload($local, ['estado' => 'pendiente', 'monto' => 2000, 'cargoIds' => [$cargo->id]]))
            ->assertSessionHasNoErrors();
        $this->assertEquals(2000, (float) $pago->fresh()->monto);
        $this->assertTrue($pago->fresh()->recibo->cancelado);
    }

    public function test_revalidating_keeps_the_original_validator()
    {
        $admin = $this->usuario();
        $otro = $this->usuario();
        $pago = $this->pago(Local::factory()->create(), $admin);

        $this->actingAs($admin)->patch(route('pagos.update-status'), ['ids' => [$pago->id], 'estado' => 'validado']);
        $this->actingAs($otro)->patch(route('pagos.update-status'), ['ids' => [$pago->id], 'estado' => 'validado']);

        $this->assertSame($admin->id, $pago->fresh()->validado_por);
    }

    public function test_store_caps_the_amount_to_the_column_size()
    {
        $this->actingAs($this->usuario())
            ->post(route('pagos.store'), $this->payload(Local::factory()->create(), ['monto' => 1e9]))
            ->assertSessionHasErrors('monto');
    }
}
