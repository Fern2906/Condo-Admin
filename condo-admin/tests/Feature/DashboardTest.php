<?php

namespace Tests\Feature;

use App\Models\Local;
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
}
