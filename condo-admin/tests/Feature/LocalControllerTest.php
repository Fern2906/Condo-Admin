<?php

namespace Tests\Feature;

use App\Models\Cargo;
use App\Models\Cuota;
use App\Models\Local;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LocalControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return [
            'code' => 'LC-11',
            'name' => 'Cafetería Central',
            'businessType' => 'Gastronómico',
            'building' => 'Torre A',
            'level' => 'Planta Baja',
            'area' => 80,
            'monthlyRent' => 20000,
            'maintenanceFee' => 2500,
            'status' => 'Disponible',
            'tenantName' => '',
            'tenantMail' => '',
            'tenantPhone' => '',
            'contractEnd' => '',
            ...$overrides,
        ];
    }

    private function cargoPara(Local $local): void
    {
        $cuota = Cuota::create([
            'nombre' => 'Mantenimiento', 'tipo' => 'ordinaria', 'periodicidad' => 'mensual',
            'monto' => 2500, 'dia_vencimiento' => '2026-10-10',
        ]);

        Cargo::create([
            'local_id' => $local->id, 'cuota_id' => $cuota->id, 'periodo' => '2026-10',
            'concepto' => 'Mantenimiento octubre', 'monto' => 2500,
            'fecha_emision' => '2026-10-01', 'fecha_vencimiento' => '2026-10-10',
        ]);
    }

    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get(route('locales.index'))->assertRedirect(route('login'));
    }

    public function test_index_lists_locales_with_their_tenant()
    {
        $this->actingAs(User::factory()->create());

        $local = Local::factory()->ocupado()->create(['codigo' => 'LC-01']);
        $tenant = User::factory()->create(['name' => 'Carlos Mendoza', 'telefono' => '5512345678']);
        $local->asignarLocatario($tenant, now()->addYear());
        Local::factory()->create(['codigo' => 'LC-02']);

        $this->get(route('locales.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('locales')
                ->has('locales', 2)
                ->where('locales.0.code', 'LC-01')
                ->where('locales.0.status', 'Ocupado')
                ->where('locales.0.tenantName', 'Carlos Mendoza')
                ->where('locales.0.tenantMail', $tenant->email)
                ->where('locales.0.tenantPhone', '5512345678')
                ->where('locales.0.contractEnd', now()->addYear()->toDateString())
                ->where('locales.1.tenantName', null)
            );
    }

    public function test_store_creates_a_local_and_its_tenant()
    {
        $this->actingAs(User::factory()->create());

        $this->post(route('locales.store'), $this->payload([
            'status' => 'Ocupado',
            'tenantName' => 'Ana Rivas',
            'tenantMail' => 'ana@example.com',
            'tenantPhone' => '+52 55 0000 0000',
            'contractEnd' => '2027-12-31',
        ]))->assertRedirect(route('locales.index'));

        $local = Local::where('codigo', 'LC-11')->firstOrFail();
        $this->assertSame('Ocupado', $local->estado);
        $this->assertSame('20000.00', $local->renta_mensual);

        $tenant = User::where('email', 'ana@example.com')->firstOrFail();
        $this->assertSame('Ana Rivas', $tenant->name);
        $this->assertDatabaseHas('residente_local', [
            'local_id' => $local->id,
            'residente_id' => $tenant->id,
            'tipo_relacion' => 'locatario',
        ]);
        $this->assertSame('2027-12-31', $local->locatario?->fecha_fin?->toDateString());
    }

    public function test_store_validates_the_form_with_spanish_messages()
    {
        $this->actingAs(User::factory()->create());
        Local::factory()->create(['codigo' => 'LC-11']);

        $this->post(route('locales.store'), $this->payload(['name' => '', 'status' => 'Inexistente', 'tenantName' => 'Sin correo']))
            ->assertSessionHasErrors([
                'code' => 'Ya existe un registro con ese código.',
                'name' => 'El campo nombre es obligatorio.',
                'status' => 'El valor seleccionado en estado no es válido.',
                'tenantMail' => 'El campo correo del locatario es obligatorio cuando se captura nombre del locatario.',
            ]);

        $this->assertSame(1, Local::count());
    }

    public function test_update_reassigns_and_removes_the_tenant()
    {
        $this->actingAs(User::factory()->create());

        $local = Local::factory()->create(['codigo' => 'LC-05']);
        $first = User::factory()->create();
        $local->asignarLocatario($first);
        $second = User::factory()->create(['email' => 'nuevo@example.com']);

        $this->put(route('locales.update', $local), $this->payload([
            'code' => 'LC-05',
            'name' => 'Nombre nuevo',
            'status' => 'Ocupado',
            'tenantName' => 'Nombre actualizado',
            'tenantMail' => 'nuevo@example.com',
        ]))->assertRedirect(route('locales.index'));

        $local->refresh();
        $this->assertSame('Nombre nuevo', $local->nombre);
        $this->assertSame($second->id, $local->locatario?->residente_id);
        $this->assertSame('Nombre actualizado', $second->fresh()?->name);
        $this->assertSame(1, $local->residentes()->count());

        $this->put(route('locales.update', $local), $this->payload(['code' => 'LC-05']))
            ->assertRedirect(route('locales.index'));

        $this->assertNull($local->fresh()?->locatario);
    }

    public function test_destroy_deletes_the_local_and_its_tenant_links()
    {
        $this->actingAs(User::factory()->create());

        $local = Local::factory()->create();
        $local->asignarLocatario(User::factory()->create());

        $this->delete(route('locales.destroy', $local))->assertRedirect(route('locales.index'));

        $this->assertModelMissing($local);
        $this->assertDatabaseCount('residente_local', 0);
    }

    public function test_destroy_refuses_locales_with_financial_history()
    {
        $this->actingAs(User::factory()->create());

        $local = Local::factory()->create();
        $this->cargoPara($local);

        $this->delete(route('locales.destroy', $local))->assertRedirect(route('locales.index'));

        $this->assertModelExists($local);
    }

    public function test_destroy_many_skips_locales_with_financial_history()
    {
        $this->actingAs(User::factory()->create());

        [$free, $withHistory] = Local::factory()->count(2)->create();
        $this->cargoPara($withHistory);

        $this->delete(route('locales.destroy-many'), ['ids' => [$free->id, $withHistory->id]])
            ->assertRedirect(route('locales.index'));

        $this->assertModelMissing($free);
        $this->assertModelExists($withHistory);
    }

    public function test_update_status_changes_the_selected_locales()
    {
        $this->actingAs(User::factory()->create());

        [$a, $b, $c] = Local::factory()->ocupado()->count(3)->create();

        $this->patch(route('locales.update-status'), ['ids' => [$a->id, $b->id], 'status' => 'Disponible'])
            ->assertRedirect(route('locales.index'));

        $this->assertSame('Disponible', $a->fresh()?->estado);
        $this->assertSame('Disponible', $b->fresh()?->estado);
        $this->assertSame('Ocupado', $c->fresh()?->estado);
    }
}
