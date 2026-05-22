<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Reservation\StoreReservationRequest;
use App\Http\Requests\Reservation\UpdateReservationStatusRequest;
use App\Models\Avis;
use App\Models\Reservation;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class ReservationController extends Controller
{
    protected function reservationDate(Reservation $reservation): ?string
    {
        return optional($reservation->reservation_date ?: $reservation->date)->toDateString();
    }

    protected function transformProviderReservation(Reservation $reservation): array
    {
        $reservation->loadMissing('service.categoryModel', 'client.user');

        return [
            'id' => $reservation->id,
            'service_id' => $reservation->service_id,
            'prestataire_id' => $reservation->prestataire_id,
            'service_name' => $reservation->service?->name,
            'service_category' => $reservation->service?->categoryModel?->name ?: $reservation->service?->category,
            'service' => $reservation->service?->name,
            'price' => $reservation->service?->price !== null ? (float) $reservation->service->price : null,
            'client_name' => $reservation->client?->user?->name,
            'client_email' => $reservation->client?->user?->email,
            'client_phone' => $reservation->client?->user?->phone,
            'client' => $reservation->client?->user?->name,
            'phone' => $reservation->phone ?: $reservation->client?->user?->phone,
            'city' => $reservation->city ?: $reservation->service?->prestataire?->user?->city,
            'guests' => $reservation->guests,
            'date' => $this->reservationDate($reservation),
            'reservation_date' => $this->reservationDate($reservation),
            'reservation_time' => $reservation->reservation_time
                ? substr((string) $reservation->reservation_time, 0, 5)
                : substr((string) $reservation->start_time, 0, 5),
            'start_time' => substr((string) $reservation->start_time, 0, 5),
            'end_time' => substr((string) $reservation->end_time, 0, 5),
            'message' => $reservation->message,
            'status' => $reservation->status,
            'created_at' => optional($reservation->created_at)->toISOString(),
        ];
    }

    protected function transformClientReservation(Reservation $reservation, array $reviewedServiceIds): array
    {
        $reservation->loadMissing('service.prestataire.user', 'client.user');

        return [
            'id' => $reservation->id,
            'service_id' => $reservation->service_id,
            'prestataire_id' => $reservation->prestataire_id,
            'service' => $reservation->service?->name,
            'prestataire' => $reservation->service?->prestataire?->nomEntreprise
                ?? $reservation->service?->prestataire?->user?->name,
            'ville' => $reservation->service?->prestataire?->adresse
                ?? $reservation->service?->prestataire?->user?->city,
            'phone' => $reservation->phone ?: $reservation->client?->user?->phone,
            'city' => $reservation->city,
            'guests' => $reservation->guests,
            'date' => $this->reservationDate($reservation),
            'reservation_date' => $this->reservationDate($reservation),
            'reservation_time' => $reservation->reservation_time
                ? substr((string) $reservation->reservation_time, 0, 5)
                : substr((string) $reservation->start_time, 0, 5),
            'start_time' => substr((string) $reservation->start_time, 0, 5),
            'end_time' => substr((string) $reservation->end_time, 0, 5),
            'price' => $reservation->service?->price !== null
                ? (float) $reservation->service->price
                : null,
            'message' => $reservation->message,
            'status' => $reservation->status,
            'has_avis' => in_array($reservation->service_id, $reviewedServiceIds, true),
        ];
    }

    public function myReservations(Request $request)
    {
        return $this->index($request);
    }

    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'client') {
            $requestedStatus = strtolower((string) $request->query('status', 'all'));
            $validStatuses = ['accepted', 'refused', 'rejected', 'pending'];
            $shouldPaginate = $request->hasAny(['page', 'per_page', 'status']);

            $reviewedServiceIds = Avis::query()
                ->where('client_id', $user->id)
                ->pluck('service_id')
                ->all();

            $baseQuery = Reservation::with('service.prestataire.user', 'client.user')
                ->where('client_id', $user->id);

            if ($shouldPaginate) {
                $countsQuery = Reservation::query()->where('client_id', $user->id);
                $counts = [
                    'all' => (clone $countsQuery)->count(),
                    'accepted' => (clone $countsQuery)->where('status', 'accepted')->count(),
                    'refused' => (clone $countsQuery)->whereIn('status', ['refused', 'rejected'])->count(),
                    'pending' => (clone $countsQuery)->where('status', 'pending')->count(),
                ];

                if (in_array($requestedStatus, $validStatuses, true)) {
                    if (in_array($requestedStatus, ['refused', 'rejected'], true)) {
                        $baseQuery->whereIn('status', ['refused', 'rejected']);
                    } else {
                        $baseQuery->where('status', $requestedStatus);
                    }
                }

                $perPage = max(1, min((int) $request->query('per_page', 4), 12));
                $paginator = $baseQuery
                    ->orderByDesc('id')
                    ->paginate($perPage)
                    ->withQueryString();

                return response()->json([
                    'success' => true,
                    'data' => $paginator->getCollection()
                        ->map(fn (Reservation $reservation) => $this->transformClientReservation($reservation, $reviewedServiceIds))
                        ->values(),
                    'counts' => $counts,
                    'meta' => [
                        'current_page' => $paginator->currentPage(),
                        'last_page' => $paginator->lastPage(),
                        'per_page' => $paginator->perPage(),
                        'total' => $paginator->total(),
                    ],
                ]);
            }

            $reservations = $baseQuery
                ->orderByDesc('id')
                ->get()
                ->map(fn (Reservation $reservation) => $this->transformClientReservation($reservation, $reviewedServiceIds))
                ->values();

            return response()->json($reservations);
        } elseif ($user->role === 'prestataire') {
            $prestataireId = $user->prestataire?->user_id;
            $reservations = Reservation::with('service', 'client.user')
                ->whereHas('service', function ($query) use ($prestataireId) {
                    $query->where('prestataire_id', $prestataireId);
                })
                ->orderByDesc('id')
                ->get()
                ->map(fn (Reservation $reservation) => $this->transformProviderReservation($reservation))
                ->values();
        } else {
            $reservations = Reservation::with(['service.categoryModel', 'service.prestataire.user', 'client.user'])
                ->orderByDesc('id')
                ->get()
                ->map(fn (Reservation $reservation) => $this->transformProviderReservation($reservation))
                ->values();
        }

        return response()->json([
            'success' => true,
            'data' => $reservations,
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
            ->with(['service', 'client.user'])
            ->whereHas('service', fn ($query) => $query->where('prestataire_id', $prestataireId))
            ->orderByRaw("
                CASE status
                    WHEN 'pending' THEN 0
                    WHEN 'accepted' THEN 1
                    WHEN 'rejected' THEN 2
                    WHEN 'refused' THEN 2
                    ELSE 3
                END
            ")
            ->orderByDesc('date')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Reservation $reservation) => $this->transformProviderReservation($reservation))
            ->values();

        return response()->json([
            'success' => true,
            'data' => $reservations,
        ]);
    }

    public function store(StoreReservationRequest $request)
    {
        $user = $request->user();

        if ($user->role !== 'client') {
            return response()->json([
                'success' => false,
                'message' => 'Only clients can make reservations.',
            ], 403);
        }

        $service = Service::findOrFail($request->service_id);
        $prestataireId = $service->prestataire_id;
        $reservationDate = Carbon::parse($request->reservation_date);

        $calendarOverride = \App\Models\Calendrier::query()
            ->where('prestataire_id', $prestataireId)
            ->whereDate('date', $reservationDate)
            ->first();

        if ($calendarOverride && $calendarOverride->available === false) {
            return response()->json([
                'success' => false,
                'message' => 'Ce prestataire est indisponible pour cette date.',
            ], 422);
        }

        $hasConflict = Reservation::query()
            ->where(function ($query) use ($request) {
                $query
                    ->whereDate('reservation_date', $request->reservation_date)
                    ->orWhereDate('date', $request->reservation_date);
            })
            ->whereIn('status', ['pending', 'accepted'])
            ->where('prestataire_id', $prestataireId)
            ->where(function ($query) use ($request) {
                $query
                    ->where('start_time', '<', $request->end_time . ':00')
                    ->where('end_time', '>', $request->start_time . ':00');
            })
            ->exists();

        if ($hasConflict) {
            return response()->json([
                'success' => false,
                'message' => 'Ce creneau est deja reserve.',
            ], 422);
        }

        $user->fill([
            'name' => $request->string('full_name')->trim()->toString(),
            'email' => $request->string('email')->trim()->lower()->toString(),
            'phone' => $request->string('phone')->trim()->toString(),
            'city' => $request->string('city')->trim()->toString(),
        ]);
        $user->save();

        $reservation = Reservation::create([
            'client_id' => $user->id,
            'prestataire_id' => $prestataireId,
            'service_id' => $service->id,
            'reservation_date' => $reservationDate->toDateString(),
            'reservation_time' => $request->reservation_time,
            'guests' => $request->guests,
            'phone' => $request->phone,
            'city' => $request->city,
            'date' => $reservationDate->toDateString(),
            'start_time' => $request->start_time,
            'end_time' => $request->end_time,
            'message' => $request->message,
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Reservation created.',
            'data' => $this->transformProviderReservation($reservation),
        ], 201);
    }

    public function updateStatus(UpdateReservationStatusRequest $request, Reservation $reservation)
    {
        return $this->updateReservationStatus($request, $reservation, $request->status);
    }

    public function acceptReservation(Request $request, Reservation $reservation)
    {
        return $this->updateReservationStatus($request, $reservation, 'accepted');
    }

    public function refuseReservation(Request $request, Reservation $reservation)
    {
        return $this->updateReservationStatus($request, $reservation, 'rejected');
    }

    protected function updateReservationStatus(Request $request, Reservation $reservation, string $status)
    {
        $user = $request->user();
        $prestataireId = $user->prestataire?->user_id;

        if ($user->role !== 'prestataire' || !$prestataireId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        if ($reservation->service->prestataire_id !== $prestataireId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        $reservation->status = $status;
        $reservation->save();

        return response()->json([
            'success' => true,
            'message' => 'Reservation status updated.',
            'data' => $reservation,
        ]);
    }

    public function destroy(Request $request, Reservation $reservation)
    {
        $user = $request->user();

        if ($user->role !== 'client' || $reservation->client_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        if ($reservation->status !== 'pending') {
            return response()->json([
                'message' => 'Seules les reservations en attente peuvent etre annulees.',
            ], 422);
        }

        $reservation->delete();

        return response()->json([
            'message' => 'Reservation annulee avec succes.',
        ]);
    }
}
