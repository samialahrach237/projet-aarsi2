<?php

namespace Database\Factories;

use App\Models\Avis;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Avis>
 */
class AvisFactory extends Factory
{
    protected $model = Avis::class;

    public function definition(): array
    {
        return [
            'rating' => fake()->numberBetween(1, 5),
            'comment' => fake()->randomElement([
                'Service professionnel et tres bien organise.',
                'Equipe ponctuelle, resultat au-dessus de nos attentes.',
                'Bonne communication et prestation de qualite.',
                'Experience fluide du debut a la fin.',
                'Je recommande pour le serieux et la disponibilite.',
            ]),
        ];
    }
}
