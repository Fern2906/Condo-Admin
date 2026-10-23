<?php

namespace Tests\Feature;

use App\Models\CategoriaIncidencia;
use App\Models\Incidencia;
use App\Models\Local;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return [
            'name' => 'Elena Gómez',
            'email' => 'elena@example.com',
            'phone' => '5543218765',
            'altPhone' => '',
            'rfc' => 'GOME800101AB1',
            'emergencyContact' => 'Luis Gómez',
            'emergencyPhone' => '5511112222',
            'active' => true,
            ...$overrides,
        ];
    }

    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get(route('users.index'))->assertRedirect(route('login'));
    }

    public function test_index_lists_users_with_their_local()
    {
        $admin = User::factory()->create(['name' => 'Admin']);
        $tenant = User::factory()->create(['name' => 'Zoe Locataria']);
        Local::factory()->ocupado()->create(['codigo' => 'LC-07', 'edificio' => 'Torre B'])->asignarLocatario($tenant);

        $this->actingAs($admin)
            ->get(route('users.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('userList')
                ->has('users', 2)
                ->where('users.0.name', 'Admin')
                ->where('users.0.local', null)
                ->where('users.1.local.code', 'LC-07')
                ->where('users.1.local.building', 'Torre B')
                ->where('users.1.local.status', 'Ocupado')
            );
    }

    public function test_store_creates_a_user()
    {
        $this->actingAs(User::factory()->create());

        $this->post(route('users.store'), $this->payload())->assertRedirect(route('users.index'));

        $user = User::where('email', 'elena@example.com')->firstOrFail();
        $this->assertSame('5543218765', $user->telefono);
        $this->assertSame('Luis Gómez', $user->contacto_emergencia);
        $this->assertTrue($user->activo);
    }

    public function test_store_rejects_a_duplicated_email()
    {
        $this->actingAs(User::factory()->create(['email' => 'elena@example.com']));

        $this->post(route('users.store'), $this->payload())
            ->assertSessionHasErrors(['email' => 'Ya existe un registro con ese correo.']);
    }

    public function test_update_changes_data_but_never_blocks_the_current_user()
    {
        $admin = User::factory()->create();
        $other = User::factory()->create();

        $this->actingAs($admin)
            ->put(route('users.update', $other), $this->payload(['active' => false]))
            ->assertRedirect(route('users.index'));

        $this->assertFalse($other->fresh()?->activo);
        $this->assertSame('elena@example.com', $other->fresh()?->email);

        $this->put(route('users.update', $admin), $this->payload(['email' => 'admin@example.com', 'active' => false]))
            ->assertRedirect(route('users.index'));

        $this->assertTrue($admin->fresh()?->activo);
    }

    public function test_destroy_deletes_users_without_related_records()
    {
        $this->actingAs(User::factory()->create());
        $user = User::factory()->create();

        $this->delete(route('users.destroy', $user))->assertRedirect(route('users.index'));

        $this->assertModelMissing($user);
    }

    public function test_destroy_refuses_the_current_user_and_users_with_related_records()
    {
        $admin = User::factory()->create();
        $reporter = User::factory()->create();
        Incidencia::create([
            'titulo' => 'Fuga', 'descripcion' => 'Gotea',
            'categoria_id' => CategoriaIncidencia::create(['nombre' => 'Plomería'])->id,
            'usuario_id' => $reporter->id,
        ]);

        $this->actingAs($admin);
        $this->delete(route('users.destroy', $admin))->assertRedirect(route('users.index'));
        $this->delete(route('users.destroy', $reporter))->assertRedirect(route('users.index'));

        $this->assertModelExists($admin);
        $this->assertModelExists($reporter);
    }

    public function test_destroy_many_skips_the_current_user()
    {
        $admin = User::factory()->create();
        [$a, $b] = User::factory()->count(2)->create();

        $this->actingAs($admin)
            ->delete(route('users.destroy-many'), ['ids' => [$admin->id, $a->id, $b->id]])
            ->assertRedirect(route('users.index'));

        $this->assertModelExists($admin);
        $this->assertModelMissing($a);
        $this->assertModelMissing($b);
    }

    public function test_update_status_blocks_other_users_only()
    {
        $admin = User::factory()->create();
        $other = User::factory()->create();

        $this->actingAs($admin)
            ->patch(route('users.update-status'), ['ids' => [$admin->id, $other->id], 'active' => false])
            ->assertRedirect(route('users.index'));

        $this->assertTrue($admin->fresh()?->activo);
        $this->assertFalse($other->fresh()?->activo);
    }

    public function test_blocked_users_are_logged_out()
    {
        $user = User::factory()->create(['activo' => false]);

        $this->actingAs($user)
            ->get(route('dashboard'))
            ->assertRedirect(route('login'))
            ->assertSessionHas('status');

        $this->assertGuest();
    }
}
