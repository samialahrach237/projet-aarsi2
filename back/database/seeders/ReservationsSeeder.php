<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Reservation;
use App\Models\Service;
use Illuminate\Database\Seeder;

class ReservationsSeeder extends Seeder
{
    public function run(): void
    {
        $clients = Client::query()->pluck('user_id');
        $services = Service::query()->get(['id', 'prestataire_id']);

        foreach ($clients as $clientId) {
            $serviceIds = $services->shuffle()->take(fake()->numberBetween(2, 4));

            foreach ($serviceIds->values() as $index => $service) {
                $attributes = [
                    'client_id' => $clientId,
                    'prestataire_id' => $service->prestataire_id,
                    'service_id' => $service->id,
                ];

                if ($index === 0) {
                    $attributes['status'] = 'accepted';
                }

                Reservation::factory()->create($attributes);
            }
        }
    }
}
