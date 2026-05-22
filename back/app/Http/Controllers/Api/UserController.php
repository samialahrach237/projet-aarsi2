<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\UpdateUserRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UserController extends Controller
{
    public function show(Request $request)
    {
        return response()->json($this->formatUserProfile($request->user()));
    }

    public function update(UpdateUserRequest $request)
    {
        $user = $request->user();
        $data = $request->validated();

        $user->fill([
            'name' => $data['name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'city' => $data['city'] ?? null,
        ]);

        if (!empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        return response()->json([
            'message' => 'Profil mis a jour avec succes.',
            'data' => $this->formatUserProfile($user->fresh()),
        ]);
    }

    public function photoProfile(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $this->formatPhotoProfile($request->user()),
        ]);
    }

    public function uploadPhotoProfile(Request $request)
    {
        $request->validate([
            'photo_profile' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $user = $request->user();
        $this->ensurePublicProfileStorage();

        if ($user->photo_profile) {
            Storage::disk('public')->delete($user->photo_profile);
        }

        $file = $request->file('photo_profile');
        $extension = strtolower($file->getClientOriginalExtension());
        $filename = 'profile_' . $user->id . '_' . Str::uuid() . '.' . $extension;
        $path = $file->storeAs('image_profile', $filename, 'public');

        $user->forceFill([
            'photo_profile' => $path,
        ])->save();

        $user->refresh();

        return response()->json([
            'success' => true,
            'message' => 'Photo de profil mise a jour avec succes.',
            'data' => [
                ...$this->formatUserProfile($user),
                ...$this->formatPhotoProfile($user),
            ],
            ...$this->formatPhotoProfile($user),
        ]);
    }

    protected function formatUserProfile($user): array
    {
        $user->loadMissing(['client', 'prestataire']);

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'city' => $user->city ?? $user->client?->address,
            'photo_profile' => $user->photo_profile,
            'photo_url' => $user->photo_url,
            'created_at' => optional($user->created_at)->toDateString(),
            'role' => $user->role,
            'client' => $user->client,
            'prestataire' => $user->prestataire,
        ];
    }

    protected function formatPhotoProfile($user): array
    {
        return [
            'photo_profile' => $user->photo_profile,
            'photo_url' => $user->photo_url,
        ];
    }

    protected function ensurePublicProfileStorage(): void
    {
        Storage::disk('public')->makeDirectory('image_profile');

        if (!file_exists(public_path('storage'))) {
            try {
                Artisan::call('storage:link');
            } catch (\Throwable $exception) {
                report($exception);
            }
        }
    }
}
