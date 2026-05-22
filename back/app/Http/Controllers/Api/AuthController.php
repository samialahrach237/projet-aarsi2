<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Models\Client;
use App\Models\Prestataire;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    protected function formatAuthenticatedUser(User $user): array
    {
        $user->loadMissing(['client', 'prestataire']);

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'phone' => $user->phone,
            'city' => $user->city,
            'photo_profile' => $user->photo_profile,
            'photo_url' => $user->photo_url,
            'client' => $user->client,
            'prestataire' => $user->prestataire,
        ];
    }

    public function register(RegisterRequest $request)
    {
        $data = $request->validated();
        $role = $data['role'] ?? 'client';

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => $role,
        ]);

        if ($role === 'client') {
            Client::create([
                'user_id' => $user->id,
                'address' => $data['address'],
            ]);
        }

        if ($role === 'prestataire') {
            Prestataire::create([
                'user_id' => $user->id,
                'nomEntreprise' => $data['nomEntreprise'],
                'description' => $data['description'] ?? null,
                'adresse' => $data['adresse'],
                'is_validated' => false,
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registration successful.',
            'user' => $this->formatAuthenticatedUser($user),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 401);
        }

        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => $this->formatAuthenticatedUser($user),
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => $this->formatAuthenticatedUser($request->user()),
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out.',
        ]);
    }
}
