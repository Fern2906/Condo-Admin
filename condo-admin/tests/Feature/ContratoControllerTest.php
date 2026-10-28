<?php

namespace Tests\Feature;

use App\Models\Local;
use App\Models\ResidenteLocal;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ContratoControllerTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(Local $local, User $residente, array $overrides = []): array
    {
        return [
            'localId' => $local->id,
            'residenteId' => $residente->id,
            'tipoRelacion' => 'locatario',
            'habitaLocal' => false,
            'responsablePago' => true,
            'fechaInicio' => '2026-01-01',
            'fechaFin' => '2027-12-31',
            ...$overrides,
        ];
    }

    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get(route('contratos.index'))->assertRedirect(route('login'));
    }

    public function test_index_lists_contracts_closest_to_expire_first()
    {
        $this->freezeTime();
        $this->actingAs(User::factory()->create());

        $lc01 = Local::factory()->ocupado()->create(['codigo' => 'LC-01', 'nombre' => 'Cafetería']);
        $lc02 = Local::factory()->ocupado()->create(['codigo' => 'LC-02']);
        $carlos = User::factory()->create(['name' => 'Carlos Mendoza', 'telefono' => '5512345678']);
        $dueno = User::factory()->create(['name' => 'Dueño']);
        $lc01->asignarLocatario($carlos, now()->addDays(10));
        $lc02->asignarLocatario(User::factory()->create(), now()->addYear());
        ResidenteLocal::create([
            'local_id' => $lc01->id, 'residente_id' => $dueno->id, 'tipo_relacion' => 'propietario', 'fecha_inicio' => '2020-01-01',
        ]);

        $this->get(route('contratos.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('features/contratos/index', false)
                ->has('contratos', 3)
                ->where('contratos.0.localCodigo', 'LC-01')
                ->where('contratos.0.localNombre', 'Cafetería')
                ->where('contratos.0.residenteNombre', 'Carlos Mendoza')
                ->where('contratos.0.residenteTelefono', '5512345678')
                ->where('contratos.0.tipoRelacion', 'locatario')
                ->where('contratos.0.fechaFin', now()->addDays(10)->toDateString())
                ->where('contratos.0.diasRestantes', 10)
                ->where('contratos.1.localCodigo', 'LC-02')
                ->where('contratos.2.residenteNombre', 'Dueño')
                ->where('contratos.2.fechaFin', null)
                ->where('contratos.2.diasRestantes', null)
                ->has('locales', 2)
                ->where('locales.0.label', 'LC-01 · Cafetería')
                ->has('residentes', 4)
            );
    }

    public function test_store_creates_a_contract()
    {
        $this->actingAs(User::factory()->create());
        $local = Local::factory()->create();
        $residente = User::factory()->create();

        $this->post(route('contratos.store'), $this->payload($local, $residente, ['habitaLocal' => true]))
            ->assertRedirect(route('contratos.index'));

        $contrato = ResidenteLocal::sole();
        $this->assertSame($local->id, $contrato->local_id);
        $this->assertSame($residente->id, $contrato->residente_id);
        $this->assertTrue($contrato->habita_local);
        $this->assertSame('2026-01-01', $contrato->fecha_inicio->toDateString());
        $this->assertSame('2027-12-31', $contrato->fecha_fin?->toDateString());
        $this->assertTrue($local->locatario?->is($contrato));
    }

    public function test_store_validates_the_form_with_spanish_messages()
    {
        $this->actingAs(User::factory()->create());
        $local = Local::factory()->create();
        $residente = User::factory()->create();

        $this->post(route('contratos.store'), $this->payload($local, $residente, [
            'tipoRelacion' => 'inquilino',
            'fechaInicio' => '2027-01-01',
            'fechaFin' => '2026-01-01',
        ]))->assertSessionHasErrors([
            'tipoRelacion' => 'El valor seleccionado en tipo de relación no es válido.',
            'fechaFin' => 'El campo fecha de fin debe ser una fecha posterior a fecha de inicio.',
        ]);

        $this->post(route('contratos.store'), $this->payload($local, $residente, ['localId' => 999]))
            ->assertSessionHasErrors(['localId' => 'El valor seleccionado en local no existe.']);

        $this->assertDatabaseCount('residente_local', 0);
    }

    public function test_a_local_can_only_have_one_tenant()
    {
        $this->actingAs(User::factory()->create());
        $local = Local::factory()->create();
        $local->asignarLocatario(User::factory()->create());

        $this->post(route('contratos.store'), $this->payload($local, User::factory()->create()))
            ->assertSessionHasErrors(['localId' => 'El local ya tiene un locatario con contrato.']);

        // Un propietario sí se puede registrar en un local que ya tiene locatario.
        $this->post(route('contratos.store'), $this->payload($local, User::factory()->create(), ['tipoRelacion' => 'propietario']))
            ->assertSessionHasNoErrors();

        $this->assertDatabaseCount('residente_local', 2);
    }

    public function test_a_resident_cannot_have_two_contracts_in_the_same_local()
    {
        $this->actingAs(User::factory()->create());
        $local = Local::factory()->create();
        $residente = User::factory()->create();
        $local->asignarLocatario($residente);

        $this->post(route('contratos.store'), $this->payload($local, $residente, ['tipoRelacion' => 'propietario']))
            ->assertSessionHasErrors(['residenteId' => 'El residente ya tiene un contrato en este local.']);
    }

    public function test_update_changes_the_contract_dates()
    {
        $this->actingAs(User::factory()->create());
        $local = Local::factory()->create();
        $residente = User::factory()->create();
        $local->asignarLocatario($residente, now()->addMonth());
        $contrato = ResidenteLocal::sole();

        // El propio contrato no cuenta como "otro locatario" del local.
        $this->put(route('contratos.update', $contrato), $this->payload($local, $residente, ['fechaFin' => '2028-06-30']))
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('contratos.index'));

        $this->assertSame('2028-06-30', $contrato->refresh()->fecha_fin?->toDateString());
    }

    public function test_destroy_deletes_the_contract_but_keeps_the_local_and_resident()
    {
        $this->actingAs(User::factory()->create());
        $local = Local::factory()->create();
        $residente = User::factory()->create();
        $local->asignarLocatario($residente);
        $contrato = ResidenteLocal::sole();

        $this->delete(route('contratos.destroy', $contrato))->assertRedirect(route('contratos.index'));

        $this->assertModelMissing($contrato);
        $this->assertModelExists($local);
        $this->assertModelExists($residente);
    }

    public function test_destroy_many_deletes_the_selected_contracts()
    {
        $this->actingAs(User::factory()->create());
        [$primero, $segundo, $otro] = Local::factory()->count(3)->create()
            ->map(function (Local $local) {
                $local->asignarLocatario(User::factory()->create());

                return $local->locatario;
            });

        $this->delete(route('contratos.destroy-many'), ['ids' => [$primero->id, $segundo->id]])
            ->assertRedirect(route('contratos.index'));

        $this->assertModelMissing($primero);
        $this->assertModelMissing($segundo);
        $this->assertModelExists($otro);
    }
}
