<?php

namespace Tests\Feature;

use Tests\TestCase;

class ApiAuthenticationTest extends TestCase
{
    public function test_protected_api_route_returns_json_401_when_not_authenticated(): void
    {
        $response = $this->getJson('/api/user');

        $response
            ->assertStatus(401)
            ->assertJson([
                'message' => 'Unauthenticated.',
            ]);
    }
}
