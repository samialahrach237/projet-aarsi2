<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Calendar\StoreCalendarRequest;
use App\Http\Requests\Calendar\UpdateCalendarRequest;
use App\Models\Calendrier;
use App\Models\Reservation;
use Carbon\Carbon;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    public function index(Request $request)
    {
        $query = Calendrier::query();

        if ($request->filled('prestataire_id')) {
            $query->where('prestataire_id', $request->get('prestataire_id'));
        }

        return response()->json([
            'success' => true,
            'data' => $query->orderBy('date')->paginate(30),
        ]);
    }

    public function providerIndex(Request $request)
    {
        $user = $request->user();
        $prestataireId = $user->prestataire?->user_id;

        if ($user->role !== 'prestataire' || !$prestataireId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        $reservations = Reservation::query()
            ->with(['service:id,name,prestataire_id', 'client.user:id,name,email,phone'])
            ->whereHas('service', fn ($query) => $query->where('prestataire_id', $prestataireId))
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();

        $availability = Calendrier::query()
            ->where('prestataire_id', $prestataireId)
            ->orderBy('date')
            ->get();

        $reservationItems = $reservations
            ->map(function (Reservation $reservation) {
                return [
                    'id' => $reservation->id,
                    'date' => optional($reservation->date)->toDateString(),
                    'start_time' => substr((string) $reservation->start_time, 0, 5),
                    'end_time' => substr((string) $reservation->end_time, 0, 5),
                    'service' => $reservation->service?->name,
                    'client' => $reservation->client?->user?->name,
                    'client_email' => $reservation->client?->user?->email,
                    'client_phone' => $reservation->client?->user?->phone,
                    'status' => $reservation->status,
                ];
            })
            ->values();

        $events = $reservations
            ->map(function (Reservation $reservation) {
                $date = optional($reservation->date)->toDateString();
                $start = $date ? Carbon::parse("{$date} {$reservation->start_time}") : null;
                $end = $date ? Carbon::parse("{$date} {$reservation->end_time}") : null;

                return [
                    'id' => "reservation-{$reservation->id}",
                    'type' => 'reservation',
                    'title' => $reservation->service?->name ?? 'Reservation',
                    'start' => $start?->toIso8601String(),
                    'end' => $end?->toIso8601String(),
                    'allDay' => false,
                    'resource' => [
                        'reservation_id' => $reservation->id,
                        'service' => $reservation->service?->name,
                        'client' => $reservation->client?->user?->name,
                        'client_email' => $reservation->client?->user?->email,
                        'client_phone' => $reservation->client?->user?->phone,
                        'status' => $reservation->status,
                    ],
                ];
            })
            ->values();

        $availabilityItems = $availability
            ->map(function (Calendrier $calendar) {
                $start = Carbon::parse($calendar->date)->startOfDay();
                $end = Carbon::parse($calendar->date)->addDay()->startOfDay();

                return [
                    'id' => $calendar->id,
                    'date' => optional($calendar->date)->toDateString(),
                    'available' => (bool) $calendar->available,
                    'event' => [
                        'id' => "availability-{$calendar->id}",
                        'type' => 'availability',
                        'title' => $calendar->available ? 'Disponible' : 'Indisponible',
                        'start' => $start->toIso8601String(),
                        'end' => $end->toIso8601String(),
                        'allDay' => true,
                        'resource' => [
                            'calendar_id' => $calendar->id,
                            'available' => (bool) $calendar->available,
                            'date' => $start->toDateString(),
                        ],
                    ],
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'data' => [
                'reservations' => $reservationItems,
                'availability' => $availabilityItems,
                'events' => $events,
            ],
        ]);
    }

    public function store(StoreCalendarRequest $request)
    {
        $user = $request->user();
        $prestataire = $user->prestataire;

        if ($user->role !== 'prestataire' || !$prestataire) {
            return response()->json([
                'success' => false,
                'message' => 'Only prestataires can manage availability.',
            ], 403);
        }

        $calendar = Calendrier::updateOrCreate(
            [
                'prestataire_id' => $prestataire->user_id,
                'date' => $request->date,
            ],
            [
                'available' => $request->available,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Availability saved.',
            'data' => $calendar,
        ], 201);
    }

    public function update(UpdateCalendarRequest $request, Calendrier $calendar)
    {
        $user = $request->user();
        $prestataireId = $user->prestataire?->user_id;

        if ($user->role !== 'prestataire' || $calendar->prestataire_id !== $prestataireId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        $calendar->update($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'Availability updated.',
            'data' => $calendar,
        ]);
    }

    public function destroy(Request $request, Calendrier $calendar)
    {
        $user = $request->user();
        $prestataireId = $user->prestataire?->user_id;

        if ($user->role !== 'prestataire' || $calendar->prestataire_id !== $prestataireId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        $calendar->delete();

        return response()->json([
            'success' => true,
            'message' => 'Availability deleted.',
        ]);
    }
}
