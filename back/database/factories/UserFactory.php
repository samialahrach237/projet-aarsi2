<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    private const CITIES = [
        'Casablanca',
        'Rabat',
        'Marrakech',
        'Tanger',
        'Fes',
        'Agadir',
        'Meknes',
        'Oujda',
    ];

    private const MOROCCAN_NAMES = [
        'Yassine El Idrissi',
        'Salma Benjelloun',
        'Amina El Fassi',
        'Omar Alaoui',
        'Nour El Mansouri',
        'Sofia Amrani',
        'Mehdi Chraibi',
        'Khadija Tazi',
        'Imane Berrada',
        'Ayoub Sqalli',
        'Meryem Zahraoui',
        'Hamza El Ghazali',
    ];

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->randomElement(self::MOROCCAN_NAMES),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->numerify('06########'),
            'city' => fake()->randomElement(self::CITIES),
            'email_verified_at' => now(),
            'role' => 'client',
            'password' => 'Password@123',
            'remember_token' => Str::random(10),
        ];
    }

    public function admin(): static
    {
        return $this->state(fn () => ['role' => 'admin']);
    }

    public function client(): static
    {
        return $this->state(fn () => ['role' => 'client']);
    }

    public function prestataire(): static
    {
        return $this->state(fn () => ['role' => 'prestataire']);
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}
