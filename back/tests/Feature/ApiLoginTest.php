<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ApiLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_login_and_receive_a_token(): void
    {
        $user = User::factory()->create([
            'email' => 'test@gmail.com',
            'password' => 'password',
            'role' => 'client',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'test@gmail.com',
            'password' => 'password',
        ]);

        $response
            ->assertOk()
            ->assertJsonStructure([
                'token',
                'user' => ['id', 'name', 'email', 'role'],
            ]);

        $this->assertNotEmpty($response->json('token'));
        $this->assertSame($user->id, $response->json('user.id'));
    }

    public function test_authenticated_user_can_access_protected_api_route_with_bearer_token(): void
    {
        $user = User::factory()->create([
            'role' => 'client',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
            'Accept' => 'application/json',
        ])->getJson('/api/user');

        $response
            ->assertOk()
            ->assertJson([
                'name' => $user->name,
                'email' => $user->email,
            ]);
    }

    public function test_login_route_returns_json_error_for_get_requests(): void
    {
        $response = $this->getJson('/api/login');

        $response
            ->assertStatus(405)
            ->assertJson([
                'message' => 'Method not allowed. Use POST for login.',
            ]);
    }
}
