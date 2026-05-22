<?php

namespace Database\Seeders;

use App\Models\Avis;
use App\Models\Reservation;
use Illuminate\Database\Seeder;

class AvisSeeder extends Seeder
{
    public function run(): void
    {
        $acceptedReservations = Reservation::query()
            ->where('status', 'accepted')
            ->with('service')
            ->get()
            ->unique(fn (Reservation $reservation) => $reservation->client_id . '-' . $reservation->service_id);

        foreach ($acceptedReservations as $reservation) {
            Avis::factory()->create([
                'client_id' => $reservation->client_id,
                'service_id' => $reservation->service_id,
            ]);
        }
    }
}
