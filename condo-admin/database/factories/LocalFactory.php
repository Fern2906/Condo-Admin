<?php

namespace Database\Factories;

use App\Models\Local;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Local>
 */
class LocalFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'codigo' => 'LC-'.fake()->unique()->numerify('###'),
            'nombre' => fake()->company(),
            'giro' => fake()->randomElement(['Comercial / Retail', 'Gastronómico', 'Servicios']),
            'edificio' => fake()->randomElement(['Torre A', 'Torre B', 'Torre C', 'Plaza Central']),
            'nivel' => fake()->randomElement(['Planta Baja', 'Piso 1', 'Piso 2']),
            'superficie_m2' => fake()->numberBetween(30, 150),
            'renta_mensual' => fake()->numberBetween(10, 35) * 1000,
            'cuota_mantenimiento' => fake()->numberBetween(15, 45) * 100,
            'estado' => 'Disponible',
        ];
    }

    public function ocupado(): static
    {
        return $this->state(fn (array $attributes) => ['estado' => 'Ocupado']);
    }
}
