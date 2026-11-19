<?php

namespace Tests\Feature;

use App\Models\AreaComun;
use App\Models\CategoriaIncidencia;
use App\Models\Incidencia;
use App\Models\Local;
use App\Models\Reservacion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Route as RouteDefinition;
use Illuminate\Support\Facades\Route;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class AutorizacionTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Rutas de la app que cualquier usuario autenticado puede usar. Cualquier
     * otra ruta de App\Http\Controllers debe llevar el middleware "admin".
     * Agregar algo aquí debe ser una decisión consciente.
     */
    private const RUTAS_SIN_ADMIN = [
        'dashboard',
        'locatarios.dashboard',
        'locatarios.incidencias.store',
        'locatarios.pagos.store',
        'locatarios.reservaciones.store',
        'mensajes.destroy',
        'mensajes.index',
        'mensajes.read',
        'mensajes.store',
    ];

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    private function locatarioCon(Local $local): User
    {
        $locatario = User::factory()->locatario()->create();
        $local->asignarLocatario($locatario);

        return $locatario;
    }

    private function areaComun(): AreaComun
    {
        return AreaComun::create(['nombre' => 'Salón de eventos', 'hora_apertura' => '08:00', 'hora_cierre' => '22:00']);
    }

    public function test_every_app_route_requires_admin_unless_explicitly_shared(): void
    {
        $sinAdmin = collect(Route::getRoutes()->getRoutes())
            ->filter(fn (RouteDefinition $route) => str_starts_with($route->getActionName(), 'App\\Http\\Controllers\\')
                && ! str_starts_with($route->getActionName(), 'App\\Http\\Controllers\\Settings\\'))
            ->reject(fn (RouteDefinition $route) => in_array('admin', $route->gatherMiddleware(), true))
            ->map(fn (RouteDefinition $route) => $route->getName())
            ->sort()
            ->values()
            ->all();

        $this->assertSame(self::RUTAS_SIN_ADMIN, $sinAdmin, 'Una ruta nueva quedó fuera del grupo "admin" en routes/web.php.');
    }

    /**
     * @return array<string, array{string}>
     */
    public static function paginasDeAdministracion(): array
    {
        return [
            'usuarios' => ['/users'],
            'locales' => ['/locales'],
            'contratos' => ['/contratos'],
            'avisos' => ['/avisos'],
            'reportes' => ['/reportes'],
            'reservaciones' => ['/reservaciones'],
            'incidencias' => ['/incidencias'],
            'categorías' => ['/categorias-incidencia'],
            'pagos' => ['/pagos'],
        ];
    }

    #[DataProvider('paginasDeAdministracion')]
    public function test_tenants_and_users_without_role_cannot_open_admin_pages(string $url): void
    {
        $this->actingAs($this->locatarioCon(Local::factory()->create()))->get($url)->assertForbidden();
        $this->actingAs(User::factory()->create())->get($url)->assertForbidden();
    }

    public function test_admin_can_still_open_admin_pages(): void
    {
        $this->actingAs(User::factory()->admin()->create());

        $this->get('/users')->assertOk();
        $this->get('/reservaciones')->assertOk();
        $this->get('/incidencias')->assertOk();
    }

    public function test_tenant_cannot_block_the_admin(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($this->locatarioCon(Local::factory()->create()))
            ->patch(route('users.update-status'), ['ids' => [$admin->id], 'active' => false])
            ->assertForbidden();

        $this->assertTrue($admin->fresh()?->activo);
    }

    public function test_tenant_cannot_delete_a_local(): void
    {
        $local = Local::factory()->create();

        $this->actingAs($this->locatarioCon(Local::factory()->create()))
            ->delete(route('locales.destroy', $local))
            ->assertForbidden();

        $this->assertModelExists($local);
    }

    public function test_tenant_cannot_use_the_admin_endpoints_for_reservations_and_incidents(): void
    {
        $this->actingAs($this->locatarioCon(Local::factory()->create()));

        $this->post(route('reservaciones.store'), [])->assertForbidden();
        $this->post(route('incidencias.store'), [])->assertForbidden();
    }

    public function test_tenant_reservation_is_always_pending_and_in_their_own_name(): void
    {
        $locatario = $this->locatarioCon(Local::factory()->create());
        $otro = User::factory()->locatario()->create();
        $area = $this->areaComun();

        $this->actingAs($locatario)
            ->post(route('locatarios.reservaciones.store'), [
                'areaComunId' => $area->id,
                'fecha' => today()->addWeek()->toDateString(),
                'horaInicio' => '10:00',
                'horaFin' => '12:00',
                'numAsistentes' => 20,
                'motivo' => 'Junta de vecinos',
                // Campos que el locatario no puede decidir: se ignoran.
                'usuarioId' => $otro->id,
                'estado' => 'aprobada',
                'motivoRechazo' => 'x',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('locatarios.dashboard'));

        $reservacion = Reservacion::sole();
        $this->assertSame($locatario->id, $reservacion->usuario_id);
        $this->assertSame('pendiente', $reservacion->estado);
        $this->assertNull($reservacion->admin_id);
        $this->assertNull($reservacion->motivo_rechazo);
        $this->assertSame(20, $reservacion->num_asistentes);
    }

    public function test_tenant_reservation_is_validated(): void
    {
        $this->actingAs($this->locatarioCon(Local::factory()->create()))
            ->post(route('locatarios.reservaciones.store'), [
                'areaComunId' => $this->areaComun()->id,
                'fecha' => today()->addWeek()->toDateString(),
                'horaInicio' => '12:00',
                'horaFin' => '10:00',
            ])
            ->assertSessionHasErrors('horaFin');

        $this->assertSame(0, Reservacion::count());
    }

    public function test_tenant_incident_is_always_open_and_ignores_admin_fields(): void
    {
        $local = Local::factory()->create();
        $locatario = $this->locatarioCon($local);
        $admin = User::factory()->admin()->create();
        $categoria = CategoriaIncidencia::create(['nombre' => 'Plomería']);

        $this->actingAs($locatario)
            ->post(route('locatarios.incidencias.store'), [
                'titulo' => 'Fuga en el baño',
                'descripcion' => 'Gotea el lavabo',
                'categoria_id' => $categoria->id,
                'prioridad' => 'alta',
                'local_id' => $local->id,
                // Campos de administración: se ignoran.
                'estado' => 'cerrada',
                'admin_id' => $admin->id,
                'costo_reparacion' => 99999,
                'comentario' => 'Resuelto',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('locatarios.dashboard'));

        $incidencia = Incidencia::sole();
        $this->assertSame($locatario->id, $incidencia->usuario_id);
        $this->assertSame($local->id, $incidencia->local_id);
        $this->assertSame('abierta', $incidencia->estado);
        $this->assertSame('alta', $incidencia->prioridad);
        $this->assertNull($incidencia->admin_id);
        $this->assertNull($incidencia->costo_reparacion);
        $this->assertNull($incidencia->comentario);
        $this->assertNull($incidencia->fecha_resolucion);
    }

    public function test_tenant_cannot_report_an_incident_for_someone_elses_local(): void
    {
        $ajeno = Local::factory()->create();
        $categoria = CategoriaIncidencia::create(['nombre' => 'Electricidad']);

        $this->actingAs($this->locatarioCon(Local::factory()->create()))
            ->post(route('locatarios.incidencias.store'), [
                'titulo' => 'Sin luz',
                'descripcion' => 'No hay luz',
                'categoria_id' => $categoria->id,
                'prioridad' => 'media',
                'local_id' => $ajeno->id,
            ])
            ->assertSessionHasErrors('local_id');

        $this->assertSame(0, Incidencia::count());
    }

    public function test_tenant_can_report_an_incident_in_a_common_area(): void
    {
        $area = $this->areaComun();
        $categoria = CategoriaIncidencia::create(['nombre' => 'Limpieza']);

        $this->actingAs($this->locatarioCon(Local::factory()->create()))
            ->post(route('locatarios.incidencias.store'), [
                'titulo' => 'Basura',
                'descripcion' => 'Se acumula basura',
                'categoria_id' => $categoria->id,
                'prioridad' => 'baja',
                'local_id' => null,
                'area_comun_id' => $area->id,
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('locatarios.dashboard'));

        $this->assertSame($area->id, Incidencia::sole()->area_comun_id);
    }
}
