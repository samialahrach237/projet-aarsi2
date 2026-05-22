<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UsersSeeder::class,
            ClientsSeeder::class,
            PrestatairesSeeder::class,
            CategoriesSeeder::class,
            ServicesSeeder::class,
            PhotosSeeder::class,
            ReservationsSeeder::class,
            AvisSeeder::class,
        ]);
    }
}
