<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Photo;
use App\Models\Reservation;
use App\Models\Service;
use Illuminate\Http\Request;

class ProviderDashboardController extends Controller
{
    protected function providerContext(Request $request): array|\Illuminate\Http\JsonResponse
    {
        $user = $request->user();
        $prestataire = $user->prestataire;

        if (!$prestataire) {
            return response()->json([
                'success' => false,
                'message' => 'Prestataire profile not found.',
            ], 403);
        }

        return [$user, $prestataire, $prestataire->user_id];
    }

    protected function buildStatistics(int $prestataireId): array
    {
        $servicesCount = Service::query()
            ->where('prestataire_id', $prestataireId)
            ->count();

        $reservations = Reservation::query()
            ->whereHas('service', fn ($query) => $query->where('prestataire_id', $prestataireId));

        $totalReservations = (clone $reservations)->count();
        $pendingReservations = (clone $reservations)->where('status', 'pending')->count();
        $acceptedReservations = (clone $reservations)->where('status', 'accepted')->count();
        $rejectedReservations = (clone $reservations)->whereIn('status', ['rejected', 'refused'])->count();

        $photosCount = Photo::query()
            ->where('prestataire_id', $prestataireId)
            ->count();

        $estimatedRevenue = Reservation::query()
            ->where('status', 'accepted')
            ->whereHas('service', fn ($query) => $query->where('prestataire_id', $prestataireId))
            ->with('service:id,price')
            ->get()
            ->sum(fn (Reservation $reservation) => (float) ($reservation->service?->price ?? 0));

        return [
            'services_count' => $servicesCount,
            'total_reservations' => $totalReservations,
            'pending_reservations' => $pendingReservations,
            'accepted_reservations' => $acceptedReservations,
            'rejected_reservations' => $rejectedReservations,
            'photos_count' => $photosCount,
            'estimated_revenue' => round($estimatedRevenue, 2),
        ];
    }

    protected function buildRecentReservations(int $prestataireId, int $limit = 5)
    {
        return Reservation::query()
            ->with(['service:id,name,prestataire_id,price,category', 'client.user:id,name,email'])
            ->whereHas('service', fn ($query) => $query->where('prestataire_id', $prestataireId))
            ->latest('id')
            ->take($limit)
            ->get()
            ->map(fn (Reservation $reservation) => [
                'id' => $reservation->id,
                'service_name' => $reservation->service?->name,
                'service_category' => $reservation->service?->category,
                'client_name' => $reservation->client?->user?->name,
                'client_email' => $reservation->client?->user?->email,
                'date' => optional($reservation->date)->toDateString(),
                'reservation_date' => optional($reservation->reservation_date ?: $reservation->date)->toDateString(),
                'reservation_time' => $reservation->reservation_time
                    ? substr((string) $reservation->reservation_time, 0, 5)
                    : substr((string) $reservation->start_time, 0, 5),
                'start_time' => substr((string) $reservation->start_time, 0, 5),
                'end_time' => substr((string) $reservation->end_time, 0, 5),
                'status' => $reservation->status,
                'amount' => $reservation->service?->price !== null ? (float) $reservation->service->price : 0,
            ])
            ->values();
    }

    public function overview(Request $request)
    {
        $context = $this->providerContext($request);

        if ($context instanceof \Illuminate\Http\JsonResponse) {
            return $context;
        }

        [$user, $prestataire, $prestataireId] = $context;

        return response()->json([
            'success' => true,
            'data' => [
                'provider' => [
                    'name' => $prestataire->nomEntreprise ?: $user->name,
                    'email' => $user->email,
                    'city' => $prestataire->adresse ?: $user->city,
                    'description' => $prestataire->description,
                    'is_validated' => (bool) $prestataire->is_validated,
                    'photo_profile' => $user->photo_profile,
                    'photo_url' => $user->photo_url,
                ],
                'stats' => $this->buildStatistics($prestataireId),
                'recent_reservations' => $this->buildRecentReservations($prestataireId),
            ],
        ]);
    }

    public function statistics(Request $request)
    {
        $context = $this->providerContext($request);

        if ($context instanceof \Illuminate\Http\JsonResponse) {
            return $context;
        }

        [, , $prestataireId] = $context;

        return response()->json([
            'success' => true,
            'data' => $this->buildStatistics($prestataireId),
        ]);
    }

    public function recentReservations(Request $request)
    {
        $context = $this->providerContext($request);

        if ($context instanceof \Illuminate\Http\JsonResponse) {
            return $context;
        }

        [, , $prestataireId] = $context;

        return response()->json([
            'success' => true,
            'data' => $this->buildRecentReservations($prestataireId),
        ]);
    }
}
