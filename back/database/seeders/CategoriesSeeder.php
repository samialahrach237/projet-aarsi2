<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategoriesSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Lieux de reception',
            'Traiteur',
            'Negafa',
            'Photographie',
            'DJ & Orchestre',
            'Bijoux',
            'Tayfer',
        ];

        foreach ($categories as $name) {
            Category::query()->updateOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name]
            );
        }
    }
}
