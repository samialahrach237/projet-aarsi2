<?php

namespace Database\Seeders;

use App\Models\Photo;
use App\Models\Prestataire;
use Illuminate\Database\Seeder;

class PhotosSeeder extends Seeder
{
    public function run(): void
    {
        Prestataire::query()->get()->each(function (Prestataire $prestataire): void {
            Photo::factory()
                ->count(fake()->numberBetween(1, 3))
                ->create([
                    'prestataire_id' => $prestataire->user_id,
                ]);
        });
    }
}
