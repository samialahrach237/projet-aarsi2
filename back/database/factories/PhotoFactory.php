<?php

namespace Database\Factories;

use App\Models\Photo;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Photo>
 */
class PhotoFactory extends Factory
{
    private const PHOTO_POOL = [
        'nagafa3.jpg',
        'nagafa4.jpg',
        'salle12.jpg',
        'photographie8.jpg',
        'bijoux6.jpg',
        'tyafar2.jpg',
        'hanna1.jpg',
        'makeup3.jpg',
    ];

    protected $model = Photo::class;

    public function definition(): array
    {
        return [
            'path' => 'prestataires/' . fake()->randomElement(self::PHOTO_POOL),
        ];
    }
}
