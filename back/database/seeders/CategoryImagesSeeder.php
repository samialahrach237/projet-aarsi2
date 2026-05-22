<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategoryImagesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categoryImages = [
            'Lieux de reception' => '/images/salle11.jpg',
            'Traiteur' => '/images/Traiteur3.jpg',
            'Negafa' => '/images/nagafa1.jpg',
            'Photographie' => '/images/photographie7.jpg',
            'DJ & Orchestre' => '/images/Dj.jpg',
            'Bijoux' => '/images/bijoux4.jpg',
            'Tayfer' => '/images/tyafar1.jpg',
        ];

        foreach ($categoryImages as $name => $image) {
            \App\Models\Category::where('name', $name)->update(['image' => $image]);
        }
    }
}
