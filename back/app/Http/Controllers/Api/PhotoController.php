<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Photo\StorePhotoRequest;
use App\Http\Requests\Photo\UpdatePhotoRequest;
use App\Models\Photo;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\Request;

class PhotoController extends Controller
{
    public function myPhotos(Request $request)
    {
        $prestataireId = $request->user()->prestataire?->user_id;

        if ($request->user()->role !== 'prestataire' || !$prestataireId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        return $this->index($prestataireId);
    }

    public function index(int $prestataireId)
    {
        $photos = Photo::query()
            ->where('prestataire_id', $prestataireId)
            ->latest()
            ->get()
            ->map(fn (Photo $photo) => $this->transformPhoto($photo))
            ->values();

        return response()->json($photos);
    }

    public function store(StorePhotoRequest $request)
    {
        $user = $request->user();
        $prestataire = $user->prestataire;

        if ($user->role !== 'prestataire' || !$prestataire) {
            return response()->json([
                'success' => false,
                'message' => 'Only prestataires can upload photos.',
            ], 403);
        }

        $path = $request->file('image')->store('photos', 'public');

        $photo = Photo::create([
            'prestataire_id' => $prestataire->user_id,
            'path' => $path,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Photo uploaded.',
            'data' => $this->transformPhoto($photo),
            'url' => $photo->url,
        ], 201);
    }

    public function update(UpdatePhotoRequest $request, Photo $photo)
    {
        $user = $request->user();
        $prestataireId = $user->prestataire?->user_id;

        if ($user->role !== 'prestataire' || $photo->prestataire_id !== $prestataireId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        Storage::disk('public')->delete($photo->path);

        $photo->update([
            'path' => $request->file('image')->store('photos', 'public'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Photo updated.',
            'data' => $this->transformPhoto($photo->fresh()),
            'url' => $photo->fresh()->url,
        ]);
    }

    public function destroy(Request $request, Photo $photo)
    {
        $user = $request->user();
        $prestataireId = $user->prestataire?->user_id;

        if ($user->role !== 'prestataire' || $photo->prestataire_id !== $prestataireId) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        Storage::disk('public')->delete($photo->path);
        $photo->delete();

        return response()->json([
            'success' => true,
            'message' => 'Photo deleted.',
        ]);
    }

    protected function transformPhoto(Photo $photo): array
    {
        return [
            'id' => $photo->id,
            'path' => $photo->path,
            'url' => $photo->url,
        ];
    }
}
