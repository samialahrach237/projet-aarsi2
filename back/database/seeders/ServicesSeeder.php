<?php

namespace Database\Seeders;

use App\Models\Prestataire;
use App\Models\Service;
use Illuminate\Database\Seeder;

class ServicesSeeder extends Seeder
{
    public function run(): void
    {
        Prestataire::query()->get()->each(function (Prestataire $prestataire): void {
            Service::factory()
                ->count(fake()->numberBetween(5, 8))
                ->create([
                    'prestataire_id' => $prestataire->user_id,
                ]);
        });
    }
}
