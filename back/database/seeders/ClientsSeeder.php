<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\User;
use Illuminate\Database\Seeder;

class ClientsSeeder extends Seeder
{
    public function run(): void
    {
        $clientUsers = User::query()->where('role', 'client')->get();

        foreach ($clientUsers as $user) {
            Client::factory()->create([
                'user_id' => $user->id,
                'address' => fake()->streetAddress() . ', ' . ($user->city ?? fake()->randomElement(['Fes', 'Rabat', 'Casablanca'])),
            ]);
        }
    }
}
