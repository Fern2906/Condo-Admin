<?php

namespace Tests\Feature;

use App\Models\AreaComun;
use App\Models\Reservacion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReservacionControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private AreaComun $area;

    private string $fecha;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();

        $this->admin = User::factory()->admin()->create();
        $this->area = AreaComun::create(['nombre' => 'Salón de eventos', 'hora_apertura' => '08:00', 'hora_cierre' => '22:00']);
        $this->fecha = today()->addWeek()->toDateString();
    }

    /**
     * @param  array<string, mixed>  $atributos
     */
    private function reservacion(array $atributos = []): Reservacion
    {
        return Reservacion::create([
            'area_comun_id' => $this->area->id,
            'usuario_id' => $this->admin->id,
            'fecha' => $this->fecha,
            'hora_inicio' => '10:00',
            'hora_fin' => '12:00',
            'estado' => 'aprobada',
            ...$atributos,
        ]);
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return [
            'areaComunId' => $this->area->id,
            'usuarioId' => $this->admin->id,
            'fecha' => $this->fecha,
            'horaInicio' => '10:00',
            'horaFin' => '12:00',
            'estado' => 'aprobada',
            ...$overrides,
        ];
    }

    // ---- Empalmes ----

    public function test_an_area_cannot_be_booked_twice_at_the_same_time(): void
    {
        $this->reservacion();

        $this->actingAs($this->admin)
            ->post(route('reservaciones.store'), $this->payload(['horaInicio' => '11:00', 'horaFin' => '13:00']))
            ->assertSessionHasErrors(['horaInicio' => 'El área ya está reservada ese día de 10:00 a 12:00.']);

        $this->assertSame(1, Reservacion::count());
    }

    public function test_back_to_back_bookings_are_allowed(): void
    {
        $this->reservacion();

        $this->actingAs($this->admin)
            ->post(route('reservaciones.store'), $this->payload(['horaInicio' => '12:00', 'horaFin' => '14:00']))
            ->assertSessionHasNoErrors();

        $this->assertSame(2, Reservacion::count());
    }

    public function test_the_same_time_in_another_area_or_day_is_allowed(): void
    {
        $this->reservacion();
        $otraArea = AreaComun::create(['nombre' => 'Terraza', 'hora_apertura' => '08:00', 'hora_cierre' => '22:00']);

        $this->actingAs($this->admin)
            ->post(route('reservaciones.store'), $this->payload(['areaComunId' => $otraArea->id]))
            ->assertSessionHasNoErrors();
        $this->actingAs($this->admin)
            ->post(route('reservaciones.store'), $this->payload(['fecha' => today()->addWeeks(2)->toDateString()]))
            ->assertSessionHasNoErrors();

        $this->assertSame(3, Reservacion::count());
    }

    public function test_overlap_check_works_when_times_are_stored_with_seconds(): void
    {
        $this->reservacion(['hora_inicio' => '10:00:00', 'hora_fin' => '12:00:00']);

        $this->actingAs($this->admin)
            ->post(route('reservaciones.store'), $this->payload(['horaInicio' => '12:00', 'horaFin' => '13:00']))
            ->assertSessionHasNoErrors();
        $this->actingAs($this->admin)
            ->post(route('reservaciones.store'), $this->payload(['horaInicio' => '09:00', 'horaFin' => '10:30']))
            ->assertSessionHasErrors('horaInicio');
    }

    public function test_a_pending_booking_holds_the_slot_for_tenants_too(): void
    {
        $this->reservacion(['estado' => 'pendiente']);
        $locatario = User::factory()->locatario()->create();

        $this->actingAs($locatario)
            ->post(route('locatarios.reservaciones.store'), [
                'areaComunId' => $this->area->id,
                'fecha' => $this->fecha,
                'horaInicio' => '11:00',
                'horaFin' => '12:00',
            ])
            ->assertSessionHasErrors('horaInicio');

        $this->assertSame(1, Reservacion::count());
    }

    public function test_rejected_and_cancelled_bookings_free_the_slot(): void
    {
        $this->reservacion(['estado' => 'rechazada']);
        $this->reservacion(['estado' => 'cancelada']);

        $this->actingAs($this->admin)
            ->post(route('reservaciones.store'), $this->payload())
            ->assertSessionHasNoErrors();

        $this->assertSame(3, Reservacion::count());
    }

    public function test_a_rejected_booking_can_be_recorded_over_a_taken_slot(): void
    {
        $this->reservacion();

        $this->actingAs($this->admin)
            ->post(route('reservaciones.store'), $this->payload(['estado' => 'rechazada', 'motivoRechazo' => 'Ocupado']))
            ->assertSessionHasNoErrors();

        $this->assertSame(2, Reservacion::count());
    }

    // ---- Fecha y horario del área ----

    public function test_bookings_in_the_past_are_rejected(): void
    {
        $ayer = today()->subDay()->toDateString();

        $this->actingAs($this->admin)
            ->post(route('reservaciones.store'), $this->payload(['fecha' => $ayer]))
            ->assertSessionHasErrors(['fecha' => 'La fecha de la reservación no puede ser anterior a hoy.']);

        $this->actingAs(User::factory()->locatario()->create())
            ->post(route('locatarios.reservaciones.store'), [
                'areaComunId' => $this->area->id,
                'fecha' => $ayer,
                'horaInicio' => '10:00',
                'horaFin' => '11:00',
            ])
            ->assertSessionHasErrors('fecha');

        $this->assertSame(0, Reservacion::count());
    }

    public function test_a_booking_for_today_is_allowed(): void
    {
        $this->actingAs($this->admin)
            ->post(route('reservaciones.store'), $this->payload(['fecha' => today()->toDateString()]))
            ->assertSessionHasNoErrors();
    }

    public function test_bookings_outside_the_area_hours_are_rejected(): void
    {
        foreach ([['07:00', '09:00'], ['21:00', '23:00']] as [$inicio, $fin]) {
            $this->actingAs($this->admin)
                ->post(route('reservaciones.store'), $this->payload(['horaInicio' => $inicio, 'horaFin' => $fin]))
                ->assertSessionHasErrors(['horaInicio' => 'El horario debe estar dentro del horario del área (08:00 a 22:00).']);
        }

        $this->actingAs($this->admin)
            ->post(route('reservaciones.store'), $this->payload(['horaInicio' => '08:00', 'horaFin' => '22:00']))
            ->assertSessionHasNoErrors();

        $this->assertSame(1, Reservacion::count());
    }

    public function test_a_past_booking_can_still_be_cancelled(): void
    {
        $pasada = $this->reservacion(['fecha' => today()->subWeek()->toDateString()]);

        $this->actingAs($this->admin)
            ->put(route('reservaciones.update', $pasada), $this->payload([
                'fecha' => $pasada->fecha->toDateString(),
                'estado' => 'cancelada',
            ]))
            ->assertSessionHasNoErrors();

        $this->assertSame('cancelada', $pasada->fresh()?->estado);
    }

    // ---- Edición y borrado individual ----

    public function test_admin_can_edit_a_single_booking_without_conflicting_with_itself(): void
    {
        $reservacion = $this->reservacion(['motivo' => 'Original']);

        $this->actingAs($this->admin)
            ->put(route('reservaciones.update', $reservacion), $this->payload(['motivo' => 'Editado']))
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('reservaciones.index'));

        $this->assertSame('Editado', $reservacion->fresh()?->motivo);
    }

    public function test_moving_a_booking_onto_another_one_is_rejected(): void
    {
        $this->reservacion();
        $otra = $this->reservacion(['hora_inicio' => '14:00', 'hora_fin' => '15:00']);

        $this->actingAs($this->admin)
            ->put(route('reservaciones.update', $otra), $this->payload(['horaInicio' => '11:00', 'horaFin' => '13:00']))
            ->assertSessionHasErrors('horaInicio');

        $this->assertSame('14:00', Reservacion::hora((string) $otra->fresh()?->hora_inicio));
    }

    public function test_admin_can_delete_a_single_booking(): void
    {
        $reservacion = $this->reservacion();

        $this->actingAs($this->admin)
            ->delete(route('reservaciones.destroy', $reservacion))
            ->assertRedirect(route('reservaciones.index'));

        $this->assertModelMissing($reservacion);
    }

    // ---- Cambio de estado en bloque ----

    public function test_bulk_approval_skips_bookings_that_would_overlap(): void
    {
        $primera = $this->reservacion(['estado' => 'rechazada']);
        $empalmada = $this->reservacion(['estado' => 'rechazada', 'hora_inicio' => '11:00', 'hora_fin' => '13:00']);
        $libre = $this->reservacion(['estado' => 'rechazada', 'hora_inicio' => '15:00', 'hora_fin' => '16:00']);

        $this->actingAs($this->admin)
            ->patch(route('reservaciones.update-status'), [
                'ids' => [$primera->id, $empalmada->id, $libre->id],
                'estado' => 'aprobada',
            ])
            ->assertRedirect(route('reservaciones.index'))
            ->assertSessionHas('inertia.flash_data.toast.type', 'warning');

        $this->assertSame('aprobada', $primera->fresh()?->estado);
        $this->assertSame('rechazada', $empalmada->fresh()?->estado);
        $this->assertSame('aprobada', $libre->fresh()?->estado);
        $this->assertSame($this->admin->id, $libre->fresh()?->admin_id);
    }

    public function test_bulk_rejection_is_never_blocked_by_overlaps(): void
    {
        // Datos previos a la regla: dos reservaciones activas empalmadas.
        $una = $this->reservacion();
        $otra = $this->reservacion(['hora_inicio' => '11:00', 'hora_fin' => '13:00']);

        $this->actingAs($this->admin)
            ->patch(route('reservaciones.update-status'), ['ids' => [$una->id, $otra->id], 'estado' => 'rechazada'])
            ->assertSessionHas('inertia.flash_data.toast.type', 'success');

        $this->assertSame('rechazada', $una->fresh()?->estado);
        $this->assertSame('rechazada', $otra->fresh()?->estado);
    }

    // ---- Áreas comunes ----

    public function test_admin_can_edit_and_delete_a_common_area(): void
    {
        $this->actingAs($this->admin)
            ->put(route('areas-comunes.update', $this->area), [
                'nombre' => 'Salón principal',
                'horaApertura' => '09:00',
                'horaCierre' => '21:00',
                'reservable' => true,
                'requiereAprobacion' => false,
            ])
            ->assertSessionHasNoErrors();

        $area = $this->area->fresh();
        $this->assertSame('Salón principal', $area?->nombre);
        $this->assertSame('09:00', Reservacion::hora((string) $area?->hora_apertura));

        $this->actingAs($this->admin)->delete(route('areas-comunes.destroy', $this->area));

        $this->assertModelMissing($this->area);
    }
}
