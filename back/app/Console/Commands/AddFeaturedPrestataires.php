<?php

namespace App\Console\Commands;

use App\Models\Avis;
use App\Models\Category;
use App\Models\Client;
use App\Models\Prestataire;
use App\Models\Service;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;

class AddFeaturedPrestataires extends Command
{
    protected $signature = 'marketplace:add-featured-prestataires';

    protected $description = 'Add Hanna and Mequeupe prestataires with services, images, and reviews.';

    public function handle(): int
    {
        $clients = Client::query()->orderBy('user_id')->get();

        if ($clients->count() < 4) {
            $this->error('At least 4 clients are required to seed provider reviews.');

            return self::FAILURE;
        }

        $definitions = [
            [
                'user' => [
                    'name' => 'Hanna',
                    'email' => 'hanna@aarsi.test',
                    'phone' => '0600000014',
                    'city' => 'Marrakech',
                ],
                'prestataire' => [
                    'nomEntreprise' => 'Hanna',
                    'slug' => 'hanna-prestige-marrakech',
                    'description' => 'Artiste du hanna ceremonial pour mariages marocains, specialisee dans les motifs fins, modernes et traditionnels.',
                    'adresse' => 'Gueliz, Marrakech',
                    'ville' => 'Marrakech',
                    'photo' => 'hanna.jpg',
                ],
                'services' => [
                    [
                        'name' => 'Hanna Royale Bridal Signature',
                        'description' => 'Application de hanna bridal avec motifs personnalises, finitions premium et accompagnement jusqu au debut de la ceremonie.',
                        'price' => 2200,
                        'duration' => 150,
                        'category' => 'Negafa',
                        'image' => 'hanna1.jpg',
                        'reviews' => [
                            ['client_index' => 0, 'rating' => 5, 'comment' => 'Travail fin et tres elegant pour la soiree du hanna.'],
                            ['client_index' => 1, 'rating' => 5, 'comment' => 'Motifs magnifiques et excellente ponctualite.'],
                        ],
                    ],
                    [
                        'name' => 'Rituel Hanna Oriental Prestige',
                        'description' => 'Pack complet de hanna traditionnel avec mise en scene raffinee et inspirations sur mesure pour la mariee.',
                        'price' => 2800,
                        'duration' => 180,
                        'category' => 'Negafa',
                        'image' => 'hanna2.jpg',
                        'reviews' => [
                            ['client_index' => 2, 'rating' => 4, 'comment' => 'Tres belle prestation et ambiance chaleureuse.'],
                            ['client_index' => 3, 'rating' => 5, 'comment' => 'Le rendu final etait sublime, exactement ce qu on voulait.'],
                        ],
                    ],
                ],
            ],
            [
                'user' => [
                    'name' => 'Mequeupe',
                    'email' => 'mequeupe@aarsi.test',
                    'phone' => '0600000015',
                    'city' => 'Casablanca',
                ],
                'prestataire' => [
                    'nomEntreprise' => 'Mequeupe',
                    'slug' => 'mequeupe-beauty-casablanca',
                    'description' => 'Studio maquillage mariee et beaute evenementielle avec finitions lumineuses, glamour et longue tenue.',
                    'adresse' => 'Maarif, Casablanca',
                    'ville' => 'Casablanca',
                    'photo' => 'makeup1.jpg',
                ],
                'services' => [
                    [
                        'name' => 'Mequeupe Glam Bridal Look',
                        'description' => 'Maquillage de mariee longue tenue avec teint lumineux, regard defini et harmonisation avec la tenue du jour J.',
                        'price' => 2600,
                        'duration' => 120,
                        'category' => 'Negafa',
                        'image' => 'makeup4.jpg',
                        'reviews' => [
                            ['client_index' => 1, 'rating' => 5, 'comment' => 'Maquillage impeccable jusqu a la fin de la soiree.'],
                            ['client_index' => 4, 'rating' => 4, 'comment' => 'Tres beau glow et excellente ecoute des envies.'],
                        ],
                    ],
                    [
                        'name' => 'Beauty Ceremony Premium by Mequeupe',
                        'description' => 'Preparation beaute premium avec essai, ajustements personnalises et look sophistique pour reception haut de gamme.',
                        'price' => 3200,
                        'duration' => 150,
                        'category' => 'Negafa',
                        'image' => 'makeup3.jpg',
                        'reviews' => [
                            ['client_index' => 0, 'rating' => 5, 'comment' => 'Resultat superbe et tres photogenique.'],
                            ['client_index' => 5, 'rating' => 5, 'comment' => 'Service tres professionnel, makeup chic et naturel.'],
                        ],
                    ],
                ],
            ],
        ];

        foreach ($definitions as $definition) {
            $user = User::query()->updateOrCreate(
                ['email' => $definition['user']['email']],
                [
                    ...$definition['user'],
                    'role' => 'prestataire',
                    'password' => Hash::make('Provider@123'),
                ]
            );

            $providerPhoto = $this->copyImage($definition['prestataire']['photo'], 'prestataires');

            $prestataire = Prestataire::query()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'nomEntreprise' => $definition['prestataire']['nomEntreprise'],
                    'slug' => $definition['prestataire']['slug'],
                    'description' => $definition['prestataire']['description'],
                    'adresse' => $definition['prestataire']['adresse'],
                    'ville' => $definition['prestataire']['ville'],
                    'photo' => $providerPhoto,
                    'is_validated' => true,
                ]
            );

            foreach ($definition['services'] as $serviceDefinition) {
                $category = Category::query()->where('name', $serviceDefinition['category'])->firstOrFail();
                $serviceImage = $this->copyImage($serviceDefinition['image'], 'services');

                $service = Service::query()->updateOrCreate(
                    [
                        'prestataire_id' => $prestataire->user_id,
                        'name' => $serviceDefinition['name'],
                    ],
                    [
                        'category_id' => $category->id,
                        'description' => $serviceDefinition['description'],
                        'price' => $serviceDefinition['price'],
                        'duration' => $serviceDefinition['duration'],
                        'category' => $category->name,
                        'image' => $serviceImage,
                    ]
                );

                foreach ($serviceDefinition['reviews'] as $review) {
                    $client = $clients[$review['client_index']];

                    Avis::query()->updateOrCreate(
                        [
                            'client_id' => $client->user_id,
                            'service_id' => $service->id,
                        ],
                        [
                            'rating' => $review['rating'],
                            'comment' => $review['comment'],
                        ]
                    );
                }
            }
        }

        $this->info('Hanna and Mequeupe prestataires are ready.');

        return self::SUCCESS;
    }

    private function copyImage(string $filename, string $directory): string
    {
        $source = $this->resolveSourcePath($filename);
        $destinationDirectory = storage_path('app/public/' . $directory);
        $destination = $destinationDirectory . DIRECTORY_SEPARATOR . $filename;

        if (!$source || !File::exists($source)) {
            throw new \RuntimeException("Missing source image: {$filename}");
        }

        if (!File::isDirectory($destinationDirectory)) {
            File::makeDirectory($destinationDirectory, 0755, true);
        }

        if (!File::exists($destination)) {
            File::copy($source, $destination);
        }

        return $directory . '/' . $filename;
    }

    private function resolveSourcePath(string $filename): ?string
    {
        $directories = [
            base_path('../frontEnd/public/image'),
            base_path('../frontEnd/public/images'),
        ];

        foreach ($directories as $directory) {
            $path = $directory . DIRECTORY_SEPARATOR . $filename;

            if (File::exists($path)) {
                return $path;
            }
        }

        return null;
    }
}
