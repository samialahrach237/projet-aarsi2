<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Prestataire;
use App\Models\Reservation;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    protected array $roles = ['admin', 'client', 'prestataire'];

    protected function formatUser(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'created_at' => optional($user->created_at)->toISOString(),
        ];
    }

    protected function syncRoleProfile(User $user): void
    {
        if ($user->role === 'client') {
            Client::query()->firstOrCreate(
                ['user_id' => $user->id],
                ['address' => $user->city ?: '']
            );
        }

        if ($user->role === 'prestataire') {
            Prestataire::query()->firstOrCreate(
                ['user_id' => $user->id],
                [
                    'nomEntreprise' => $user->name,
                    'slug' => Str::slug($user->name . '-' . $user->id),
                    'adresse' => $user->city ?: '',
                    'is_validated' => false,
                ]
            );
        }
    }

    public function stats(): JsonResponse
    {
        return response()->json([
            'users' => User::count(),
            'clients' => User::where('role', 'client')->count(),
            'prestataires' => User::where('role', 'prestataire')->count(),
            'services' => Service::count(),
            'reservations' => Reservation::count(),
            'pendingReservations' => Reservation::where('status', 'pending')->count(),
            'acceptedReservations' => Reservation::where('status', 'accepted')->count(),
            'rejectedReservations' => Reservation::whereIn('status', ['rejected', 'refused'])->count(),
            'pendingPrestataires' => Prestataire::where('is_validated', false)->count(),
            'validatedPrestataires' => Prestataire::where('is_validated', true)->count(),
        ]);
    }

    public function index(): JsonResponse
    {
        return response()->json([
            'data' => User::query()
                ->latest()
                ->get(['id', 'name', 'email', 'role', 'created_at'])
                ->map(fn (User $user) => $this->formatUser($user))
                ->values(),
        ]);
    }

    public function users(): JsonResponse
    {
        return $this->index();
    }

    public function create(): JsonResponse
    {
        return response()->json([
            'data' => [
                'roles' => $this->roles,
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', Rule::in($this->roles)],
        ]);

        $user = User::query()->create($validated);
        $this->syncRoleProfile($user);

        return response()->json([
            'message' => 'Utilisateur ajoute avec succes.',
            'data' => $this->formatUser($user),
        ], 201);
    }

    public function edit(User $user): JsonResponse
    {
        return response()->json([
            'data' => [
                'user' => $this->formatUser($user),
                'roles' => $this->roles,
            ],
        ]);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['required', Rule::in($this->roles)],
            'password' => ['nullable', 'string', 'min:8'],
        ]);

        if (blank($validated['password'] ?? null)) {
            unset($validated['password']);
        }

        $user->update($validated);
        $this->syncRoleProfile($user);

        return response()->json([
            'message' => 'Utilisateur modifie avec succes.',
            'data' => $this->formatUser($user->fresh()),
        ]);
    }

    public function pendingPrestataires(): JsonResponse
    {
        return response()->json([
            'data' => Prestataire::query()
                ->with('user:id,email')
                ->where('is_validated', false)
                ->latest('user_id')
                ->get()
                ->map(function (Prestataire $prestataire) {
                    $photoPath = $prestataire->photo;

                    return [
                        'id' => $prestataire->user_id,
                        'nomEntreprise' => $prestataire->nomEntreprise,
                        'email' => $prestataire->user?->email,
                        'adresse' => $prestataire->adresse,
                        'photo' => $photoPath,
                        'photo_url' => $photoPath ? asset('storage/' . ltrim($photoPath, '/')) : null,
                        'is_validated' => (bool) $prestataire->is_validated,
                    ];
                })
                ->values(),
        ]);
    }

    public function validatePrestataire(int $id): JsonResponse
    {
        $prestataire = Prestataire::query()->findOrFail($id);

        $prestataire->update([
            'is_validated' => true,
        ]);

        return response()->json([
            'message' => 'Prestataire validated successfully.',
            'data' => [
                'id' => $prestataire->user_id,
                'is_validated' => (bool) $prestataire->is_validated,
            ],
        ]);
    }

    public function deleteUser(int $id): JsonResponse
    {
        $user = User::query()->findOrFail($id);
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully.',
        ]);
    }
}
