<?php

namespace Database\Factories;

use App\Models\Client;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Client>
 */
class ClientFactory extends Factory
{
    private const CITIES = [
        'Casablanca',
        'Rabat',
        'Fes',
        'Marrakech',
        'Tanger',
        'Agadir',
    ];

    protected $model = Client::class;

    public function definition(): array
    {
        $city = fake()->randomElement(self::CITIES);

        return [
            'address' => fake()->streetAddress() . ', ' . $city,
        ];
    }
}
