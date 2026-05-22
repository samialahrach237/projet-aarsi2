<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Avis\StoreAvisRequest;
use App\Http\Requests\Avis\UpdateAvisRequest;
use App\Models\Avis;
use App\Models\Reservation;
use Illuminate\Http\Request;

class AvisController extends Controller
{
    public function publicIndex()
    {
        $avis = Avis::query()
            ->with(['client.user:id,name,city', 'service.prestataire.user', 'service.categoryModel'])
            ->latest()
            ->get()
            ->map(fn (Avis $avis) => $this->formatPublicAvis($avis))
            ->values();

        return response()->json([
            'success' => true,
            'data' => $avis,
        ]);
    }

    public function index(Request $request)
    {
        $query = Avis::with(['service.prestataire.user', 'service.categoryModel'])
            ->where('client_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->orderByDesc('id');

        if ($request->hasAny(['page', 'per_page'])) {
            $perPage = max(1, min((int) $request->query('per_page', 6), 12));
            $paginator = $query->paginate($perPage)->withQueryString();

            return response()->json([
                'success' => true,
                'data' => $paginator->getCollection()
                    ->map(fn (Avis $avis) => $this->formatAvis($avis))
                    ->values(),
                'meta' => [
                    'current_page' => $paginator->currentPage(),
                    'last_page' => $paginator->lastPage(),
                    'per_page' => $paginator->perPage(),
                    'total' => $paginator->total(),
                ],
            ]);
        }

        $avis = $query->get()->map(fn (Avis $avis) => $this->formatAvis($avis));

        return response()->json($avis->values());
    }

    public function store(StoreAvisRequest $request)
    {
        $user = $request->user();

        if ($user->role !== 'client') {
            return response()->json([
                'success' => false,
                'message' => 'Only clients can leave reviews.',
            ], 403);
        }

        $hasReservation = Reservation::query()
            ->where('client_id', $user->id)
            ->where('service_id', $request->service_id)
            ->where('status', 'accepted')
            ->exists();

        if (!$hasReservation) {
            return response()->json([
                'success' => false,
                'message' => 'You can only review services you have reserved.',
            ], 422);
        }

        $existingAvis = Avis::query()
            ->where('client_id', $user->id)
            ->where('service_id', $request->service_id)
            ->first();

        if ($existingAvis) {
            return response()->json([
                'success' => false,
                'message' => 'You have already reviewed this service.',
            ], 422);
        }

        $avis = Avis::create([
            'client_id' => $user->id,
            'service_id' => $request->service_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Review added.',
            'data' => $this->formatAvis($avis->load('service.prestataire.user', 'service.categoryModel')),
        ], 201);
    }

    public function update(UpdateAvisRequest $request, Avis $avis)
    {
        if ($avis->client_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $avis->update($request->validated());

        return response()->json([
            'message' => 'Avis mis a jour avec succes.',
            'data' => $this->formatAvis($avis->fresh()->load('service.prestataire.user', 'service.categoryModel')),
        ]);
    }

    public function destroy(Request $request, Avis $avis)
    {
        if ($avis->client_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 403);
        }

        $avis->delete();

        return response()->json([
            'message' => 'Avis supprime avec succes.',
        ]);
    }

    protected function formatAvis(Avis $avis): array
    {
        return [
            'id' => $avis->id,
            'service_id' => $avis->service_id,
            'service' => $avis->service?->name,
            'service_image' => $avis->service?->image_url,
            'rating' => (int) $avis->rating,
            'comment' => $avis->comment,
            'prestataire' => $avis->service?->prestataire?->nomEntreprise
                ?? $avis->service?->prestataire?->user?->name,
            'prestataire_image' => $avis->service?->prestataire?->photo_url,
            'category' => $avis->service?->categoryModel?->name ?: $avis->service?->category,
            'date' => optional($avis->created_at)->toDateString(),
        ];
    }

    protected function formatPublicAvis(Avis $avis): array
    {
        $clientName = $avis->client?->user?->name ?: 'Client AARSSI';
        $city = $avis->client?->user?->city ?: $avis->service?->prestataire?->ville ?: 'Maroc';
        $provider = $avis->service?->prestataire?->nomEntreprise
            ?? $avis->service?->prestataire?->user?->name
            ?? 'Prestataire';

        return [
            'id' => $avis->id,
            'client_name' => $clientName,
            'client_city' => $city,
            'service_name' => $avis->service?->name ?: 'Service',
            'service_category' => $avis->service?->categoryModel?->name ?: $avis->service?->category ?: 'Service',
            'provider_name' => $provider,
            'rating' => (int) $avis->rating,
            'comment' => $avis->comment,
            'service_image' => $avis->service?->image_url,
            'provider_image' => $avis->service?->prestataire?->photo_url,
            'created_at' => optional($avis->created_at)->toDateString(),
        ];
    }
}
