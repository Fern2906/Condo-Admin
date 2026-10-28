<?php

namespace Tests\Feature;

use App\Models\Aviso;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AvisoControllerTest extends TestCase
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
    private function payload(array $overrides = []): array
    {
        return [
            'titulo' => 'Corte de agua',
            'contenido' => 'El martes no habrá servicio de agua de 9:00 a 13:00.',
            'tipo' => 'mantenimiento',
            'dirigidoA' => 'todos',
            'fechaEvento' => '',
            'fechaPublicacion' => '',
            'fechaExpiracion' => '',
            'fijado' => false,
            'activo' => true,
            ...$overrides,
        ];
    }

    private function aviso(User $autor, array $atributos = []): Aviso
    {
        return Aviso::create([
            'titulo' => 'Aviso', 'contenido' => 'Contenido', 'publicado_por' => $autor->id,
            ...$atributos,
        ]);
    }

    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get(route('avisos.index'))->assertRedirect(route('login'));
    }

    public function test_index_lists_pinned_avisos_first_with_their_status()
    {
        $admin = User::factory()->create(['name' => 'Admin']);
        $this->aviso($admin, ['titulo' => 'Reciente', 'fecha_publicacion' => now()]);
        $this->aviso($admin, ['titulo' => 'Expirado', 'fecha_publicacion' => now()->subWeek(), 'fecha_expiracion' => now()->subDay()]);
        $this->aviso($admin, ['titulo' => 'Fijado', 'fecha_publicacion' => now()->subMonth(), 'fijado' => true]);

        $this->actingAs($admin)
            ->get(route('avisos.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('features/avisos/index', false)
                ->has('avisos', 3)
                ->where('avisos.0.titulo', 'Fijado')
                ->where('avisos.0.fijado', true)
                ->where('avisos.1.titulo', 'Reciente')
                ->where('avisos.1.vigente', true)
                ->where('avisos.1.publicadoPorNombre', 'Admin')
                ->where('avisos.2.titulo', 'Expirado')
                ->where('avisos.2.vigente', false)
            );
    }

    public function test_store_publishes_an_aviso_as_the_current_user()
    {
        $this->freezeSecond();
        $admin = User::factory()->create();

        $this->actingAs($admin)
            ->post(route('avisos.store'), $this->payload(['fechaExpiracion' => now()->addWeek()->toDateTimeString()]))
            ->assertRedirect(route('avisos.index'));

        $aviso = Aviso::sole();
        $this->assertSame('Corte de agua', $aviso->titulo);
        $this->assertSame($admin->id, $aviso->publicado_por);
        $this->assertTrue($aviso->fecha_publicacion->equalTo(now()));
        $this->assertTrue($aviso->fecha_expiracion?->equalTo(now()->addWeek()));
        $this->assertNull($aviso->fecha_evento);
    }

    public function test_store_validates_the_form_with_spanish_messages()
    {
        $this->actingAs(User::factory()->create());

        $this->post(route('avisos.store'), $this->payload([
            'titulo' => '',
            'tipo' => 'inexistente',
            'fechaPublicacion' => '2026-10-10 10:00:00',
            'fechaExpiracion' => '2026-10-01 10:00:00',
        ]))->assertSessionHasErrors([
            'titulo' => 'El campo título es obligatorio.',
            'tipo' => 'El valor seleccionado en tipo no es válido.',
            'fechaExpiracion' => 'El campo fecha de expiración debe ser una fecha posterior a fecha de publicación.',
        ]);

        $this->assertDatabaseCount('avisos', 0);
    }

    public function test_update_keeps_the_publication_date_when_it_is_not_sent()
    {
        $admin = User::factory()->create();
        $aviso = $this->aviso($admin, ['fecha_publicacion' => '2026-01-15 08:00:00']);

        $this->actingAs($admin)
            ->put(route('avisos.update', $aviso), $this->payload(['titulo' => 'Corte de agua (actualizado)', 'fijado' => true]))
            ->assertRedirect(route('avisos.index'));

        $aviso->refresh();
        $this->assertSame('Corte de agua (actualizado)', $aviso->titulo);
        $this->assertTrue($aviso->fijado);
        $this->assertSame('2026-01-15 08:00:00', $aviso->fecha_publicacion->toDateTimeString());
    }

    public function test_update_status_deactivates_the_selected_avisos()
    {
        $admin = User::factory()->create();
        $primero = $this->aviso($admin);
        $segundo = $this->aviso($admin);
        $otro = $this->aviso($admin);

        $this->actingAs($admin)
            ->patch(route('avisos.update-status'), ['ids' => [$primero->id, $segundo->id], 'activo' => false])
            ->assertRedirect(route('avisos.index'));

        $this->assertFalse($primero->refresh()->activo);
        $this->assertFalse($segundo->refresh()->activo);
        $this->assertTrue($otro->refresh()->activo);
    }

    public function test_destroy_many_deletes_the_selected_avisos()
    {
        $admin = User::factory()->create();
        $primero = $this->aviso($admin);
        $otro = $this->aviso($admin);

        $this->actingAs($admin)
            ->delete(route('avisos.destroy-many'), ['ids' => [$primero->id]])
            ->assertRedirect(route('avisos.index'));

        $this->assertModelMissing($primero);
        $this->assertModelExists($otro);
    }
}
