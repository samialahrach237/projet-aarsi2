<?php

namespace Database\Factories;

use App\Models\Reservation;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Reservation>
 */
class ReservationFactory extends Factory
{
    protected $model = Reservation::class;

    public function definition(): array
    {
        $date = fake()->dateTimeBetween('+2 days', '+3 months');
        $startHour = fake()->numberBetween(9, 18);
        $startMinute = fake()->randomElement([0, 30]);
        $start = Carbon::instance($date)->setTime($startHour, $startMinute);
        $duration = fake()->numberBetween(1, 4) * 30;
        $end = (clone $start)->addMinutes($duration);

        return [
            'reservation_date' => $start->toDateString(),
            'date' => $start->toDateString(),
            'start_time' => $start->format('H:i:s'),
            'end_time' => $end->format('H:i:s'),
            'message' => fake()->randomElement([
                'Nous souhaitons une prestation elegante pour notre mariage familial.',
                'Merci de nous confirmer la disponibilite et les options possibles.',
                'Nous aimerions echanger sur les details de l evenement avant validation.',
            ]),
            'status' => fake()->randomElement(['pending', 'accepted', 'refused']),
        ];
    }
}
