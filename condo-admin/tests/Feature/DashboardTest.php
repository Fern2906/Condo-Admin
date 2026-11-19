<?php

namespace Tests\Feature;

use App\Models\AreaComun;
use App\Models\Local;
use App\Models\Reservacion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertOk();
    }

    public function test_dashboard_shows_the_condo_stats()
    {
        $this->actingAs(User::factory()->create());

        Local::factory()->ocupado()->count(3)->create();
        Local::factory()->count(2)->create();

        $this->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('dashboard')
                ->where('stats.localesTotal', 5)
                ->where('stats.localesOcupados', 3)
                ->where('stats.localesDisponibles', 2)
                ->where('stats.incidenciasAbiertas', 0)
                ->where('stats.reservacionesHoy', 0)
            );
    }

    public function test_dashboard_counts_todays_active_and_approved_reservations()
    {
        $this->withoutVite();
        $admin = User::factory()->admin()->create();
        $area = AreaComun::create(['nombre' => 'Salón', 'hora_apertura' => '07:00', 'hora_cierre' => '23:00']);

        $reservar = fn (string $estado, string $inicio, string $fin, ?string $fecha = null) => Reservacion::create([
            'area_comun_id' => $area->id,
            'usuario_id' => $admin->id,
            'fecha' => $fecha ?? today()->toDateString(),
            'hora_inicio' => $inicio,
            'hora_fin' => $fin,
            'estado' => $estado,
        ]);

        $reservar('aprobada', '08:00', '09:00');
        $reservar('aprobada', '10:00', '11:00');
        $reservar('pendiente', '12:00', '13:00');
        $reservar('rechazada', '14:00', '15:00');
        $reservar('cancelada', '16:00', '17:00');
        $reservar('aprobada', '08:00', '09:00', today()->addDay()->toDateString());

        $this->actingAs($admin)
            ->get(route('dashboard'))
            ->assertInertia(fn (Assert $page) => $page
                ->where('stats.reservacionesHoy', 3)
                ->where('stats.reservacionesHoyAprobadas', 2)
            );
    }
}
