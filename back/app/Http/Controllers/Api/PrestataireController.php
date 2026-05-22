<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Prestataire;

class PrestataireController extends Controller
{
    public function index()
    {
        $prestataires = Prestataire::query()
            ->select('user_id', 'nomEntreprise', 'slug', 'description', 'adresse', 'photo')
            ->where('is_validated', true)
            ->has('services')
            ->with([
                'services' => fn ($query) => $query
                    ->select('id', 'prestataire_id', 'name', 'price', 'category')
                    ->orderBy('price'),
                'photos' => fn ($query) => $query
                    ->select('id', 'prestataire_id', 'path')
                    ->latest(),
            ])
            ->orderBy('nomEntreprise')
            ->get()
            ->map(function (Prestataire $prestataire) {
                $firstPhoto = $prestataire->photos->first();

                return [
                    'id' => $prestataire->user_id,
                    'nomEntreprise' => $prestataire->nomEntreprise,
                    'slug' => $prestataire->slug,
                    'description' => $prestataire->description,
                    'adresse' => $prestataire->adresse,
                    'image_path' => $firstPhoto?->path,
                    'image' => $firstPhoto?->url ?? $prestataire->photo_url,
                    'photos' => $prestataire->photos->map(function ($photo) {
                        return [
                            'id' => $photo->id,
                            'path' => $photo->path,
                            'url' => $photo->url,
                        ];
                    })->values(),
                    'services' => $prestataire->services->map(function ($service) {
                        return [
                            'id' => $service->id,
                            'name' => $service->name,
                            'price' => (float) $service->price,
                            'category' => $service->category,
                        ];
                    })->values(),
                ];
            })
            ->values();

        return response()->json($prestataires);
    }
}
