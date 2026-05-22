<?php

namespace Database\Factories;

use App\Models\Prestataire;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Prestataire>
 */
class PrestataireFactory extends Factory
{
    private const PHOTO_POOL = [
        'nagafa1.jpg',
        'nagafa2.jpg',
        'salle11.jpg',
        'Traiteur3.jpg',
        'photographie7.jpg',
        'bijoux4.jpg',
        'tyafar1.jpg',
        'hero.jpg',
    ];

    private const CITIES = [
        'Casablanca',
        'Rabat',
        'Marrakech',
        'Tanger',
        'Agadir',
        'Fes',
        'Meknes',
        'Oujda',
    ];

    private const COMPANY_NAMES = [
        'Negafa Zahra Luxe',
        'Palais Andalou Marrakech',
        'Traiteur Al Baraka',
        'Studio Nour Photography',
        'Orchestre Amina',
        'Bijoux Royale Fes',
        'Les Jardins Majorelle Events',
        'Tayfer Sabahat',
        'Maison Jawhara Reception',
        'Riad Al Warda',
        'Negafa Sultana Prestige',
        'Palais des Roses d\'Or',
        'Traiteur Medina Gourmet',
        'Studio Hassan Photography',
        'Orchestre Andalou Live',
        'Bijoux Fassi Heritage',
        'Villa Bahia Events',
        'Tayfer Traditionnel Maroc',
        'Maison Aicha Luxury',
        'Riad Bahia Wellness',
        'Negafa Lalla Amina',
        'Palais Imperial Events',
        'Traiteur Dar Essalam',
        'Studio Medina Photos',
        'Orchestre Chaabi Stars',
        'Bijoux Maroc Royal',
        'Jardin Secret Weddings',
        'Tayfer Al Fassia',
        'Maison Zahra Events',
        'Riad Andalou Spa',
    ];

    protected $model = Prestataire::class;

    public function definition(): array
    {
        $city = fake()->randomElement(self::CITIES);

        return [
            'nomEntreprise' => fake()->unique()->randomElement(self::COMPANY_NAMES),
            'description' => fake()->randomElement([
                'Maison marocaine specialisee dans les celebrations de mariage avec une attention particuliere aux details.',
                'Equipe passionnee qui cree des experiences elegantes pour les fiancailles, mariages et grandes receptions.',
                'Prestataire reconnu pour son accueil, sa ponctualite et son savoir-faire inspire des traditions marocaines.',
            ]),
            'adresse' => fake()->streetAddress() . ', ' . $city,
            'photo' => 'prestataires/' . fake()->randomElement(self::PHOTO_POOL),
            'ville' => $city,
            'is_validated' => true,
        ];
    }
}
