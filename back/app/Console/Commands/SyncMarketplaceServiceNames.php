<?php

namespace App\Console\Commands;

use App\Models\Service;
use Illuminate\Console\Command;

class SyncMarketplaceServiceNames extends Command
{
    protected $signature = 'marketplace:sync-service-names';

    protected $description = 'Distribute curated marketplace service names across existing service records by category.';

    private const NAMES_BY_CATEGORY = [
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

    public function handle(): int
    {
        $updated = 0;

        foreach (self::NAMES_BY_CATEGORY as $category => $names) {
            $services = Service::query()
                ->where('category', $category)
                ->orderBy('id')
                ->get();

            foreach ($services as $index => $service) {
                $nextName = $names[$index % count($names)];

                if ($service->name === $nextName) {
                    continue;
                }

                $service->forceFill(['name' => $nextName])->save();
                $updated++;
            }
        }

        $this->info("Marketplace service names synced: {$updated}");

        return self::SUCCESS;
    }
}
