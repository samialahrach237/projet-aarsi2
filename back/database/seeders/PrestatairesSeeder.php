<?php

namespace Database\Seeders;

use App\Models\Prestataire;
use App\Models\User;
use Illuminate\Database\Seeder;

class PrestatairesSeeder extends Seeder
{
    public function run(): void
    {
        $providerUsers = User::query()->where('role', 'prestataire')->get();

        foreach ($providerUsers as $index => $user) {
            $attributes = [
                'user_id' => $user->id,
                'ville' => $user->city,
                'adresse' => fake()->streetAddress() . ', ' . ($user->city ?? fake()->randomElement(['Fes', 'Rabat', 'Casablanca'])),
                'photo' => 'prestataires/prestataire-' . (($index % 8) + 1) . '.jpg',
            ];

            if ($index === 0) {
                $attributes['nomEntreprise'] = 'Palais Andalou Marrakech';
            }

            Prestataire::factory()->create($attributes);
        }
    }
}
