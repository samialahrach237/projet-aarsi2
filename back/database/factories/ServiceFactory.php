<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Service;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Service>
 */
class ServiceFactory extends Factory
{
    private const IMAGE_POOL_BY_CATEGORY = [
        'Lieux de reception' => ['salle11.jpg', 'salle12.jpg', 'salle2.jpg', 'salle6.jpg', 'salle7.jpg', 'salle8.jpg', 'salle9.jpg', 'image6.jpg'],
        'Traiteur' => ['Traiteur3.jpg'],
        'Negafa' => ['nagafa1.jpg', 'nagafa2.jpg', 'nagafa3.jpg', 'nagafa4.jpg', 'nagafa5.jpg', 'nagafa6.jpg', 'nagafa7.jpg', 'nagafa8.jpg', 'nagafa9.jpg'],
        'Photographie' => ['photographie7.jpg', 'photographie8.jpg', 'photographie9.jpg', 'photograph2.jpg'],
        'DJ & Orchestre' => ['Dj.jpg'],
        'Bijoux' => ['bijoux4.jpg', 'bijoux6.jpg', 'bijoux7.jpg', 'bijoux8.jpg', 'bijoux9.jpg'],
        'Tayfer' => ['tyafar1.jpg', 'tyafar2.jpg', 'tyafar3.jpg', 'tyafar4.jpg', 'tyafar5.jpg'],
    ];

    private const SERVICES_BY_CATEGORY = [
        'Lieux de reception' => [
            'Palais des Roses',
            'Jardins de l Atlas',
            'Riad Majestic',
            'Domaine Al Qasr',
            'Villa Bahia Events',
            'Palais Imperial',
            'Jardin Secret',
            'Riad Andalou',
        ],
        'Traiteur' => [
            'Menu marocain signature',
            'Buffet oriental prestige',
            'Cocktail Andalou',
            'Table royale Al Baraka',
            'Traiteur Medina Gourmet',
            'Dar Essalam Cuisine',
            'Buffet Imperial',
            'Cocktail Royal Maroc',
        ],
        'Negafa' => [
            'Pack Negafa royale',
            'Accompagnement amaria premium',
            'Tenues traditionnelles luxe',
            'Ceremonie complete Zahra',
            'Negafa Sultana Prestige',
            'Lalla Amina Collection',
            'Negafa Jawhara Luxe',
            'Ceremonie Andalou Complete',
        ],
        'Photographie' => [
            'Reportage mariage premium',
            'Shooting couple oriental',
            'Film de mariage cinematic',
            'Album souvenir luxe',
            'Studio Hassan Photography',
            'Medina Photos Pro',
            'Reportage Royal',
            'Album Prestige Maroc',
        ],
        'DJ & Orchestre' => [
            'Orchestre live chaabi',
            'DJ mariage oriental',
            'Animation mixte premium',
            'Ambiance entree des maries',
            'Orchestre Andalou Live',
            'Chaabi Stars Band',
            'DJ Oriental Mix',
            'Animation Complete Mariage',
        ],
        'Bijoux' => [
            'Parure royale Fassi',
            'Collection mariee Jawhara',
            'Bijoux loues prestige',
            'Set caftan et joyaux',
            'Bijoux Maroc Royal',
            'Fassi Heritage Collection',
            'Parure Sultana',
            'Bijoux Traditionnels Maroc',
        ],
        'Tayfer' => [
            'Tayfer cuivre artisanal',
            'Presentation dattes et lait',
            'Pack accueil traditionnel',
            'Tayfer luxe personnalise',
            'Tayfer Al Fassia',
            'Traditionnel Maroc Tayfer',
            'Tayfer Prestige',
            'Accueil Royal Maroc',
        ],
    ];

    protected $model = Service::class;

    public function definition(): array
    {
        $category = fake()->randomElement(array_keys(self::SERVICES_BY_CATEGORY));
        $categoryModel = Category::query()->where('name', $category)->first();

        return [
            'name' => fake()->randomElement(self::SERVICES_BY_CATEGORY[$category]),
            'description' => fake()->randomElement([
                'Une prestation pensee pour sublimer votre mariage avec elegance, confort et savoir-faire marocain.',
                'Service haut de gamme adapte aux ceremonies marocaines, aux grands evenements et aux receptions familiales.',
                'Une offre flexible avec accompagnement professionnel, finitions soignees et ambiance raffinee.',
            ]),
            'price' => fake()->numberBetween(1500, 25000),
            'duration' => fake()->numberBetween(2, 10) * 30,
            'category_id' => $categoryModel?->id,
            'category' => $category,
            'image' => 'services/' . fake()->randomElement(self::IMAGE_POOL_BY_CATEGORY[$category]),
        ];
    }
}
