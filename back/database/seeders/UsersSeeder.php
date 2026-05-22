<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        $credentials = collect();

        $this->createUserWithPlainPassword(
            $credentials,
            User::factory()->admin()->make([
                'name' => 'Admin AARSI',
                'email' => 'admin@gmail.com',
                'phone' => '0600000001',
                'city' => 'Rabat',
            ])->makeHidden('photo_url')->toArray(),
            'Admin@123',
            'admin'
        );

        $this->createUserWithPlainPassword(
            $credentials,
            User::factory()->client()->make([
                'name' => 'Client Test',
                'email' => 'client@gmail.com',
                'phone' => '0600000002',
                'city' => 'Casablanca',
            ])->makeHidden('photo_url')->toArray(),
            'Client@123',
            'client'
        );

        $this->createUserWithPlainPassword(
            $credentials,
            User::factory()->prestataire()->make([
                'name' => 'Provider Test',
                'email' => 'provider@gmail.com',
                'phone' => '0600000003',
                'city' => 'Fes',
            ])->makeHidden('photo_url')->toArray(),
            'Provider@123',
            'prestataire'
        );

        foreach (range(1, 5) as $index) {

            $attributes = User::factory()
                ->client()
                ->make()
                ->makeHidden('photo_url')
                ->toArray();

            $this->createUserWithPlainPassword(
                $credentials,
                $attributes,
                $this->generatePlainPassword('Client', $index),
                'client'
            );
        }

        foreach (range(1, 5) as $index) {

            $attributes = User::factory()
                ->prestataire()
                ->make()
                ->makeHidden('photo_url')
                ->toArray();

            $this->createUserWithPlainPassword(
                $credentials,
                $attributes,
                $this->generatePlainPassword('Provider', $index),
                'prestataire'
            );
        }

        $this->displayCredentials($credentials);
    }

    private function createUserWithPlainPassword(
        Collection $credentials,
        array $attributes,
        string $plainPassword,
        string $role
    ): User {

        unset($attributes['password']);

        $user = User::create([
            ...$attributes,
            'role' => $role,
            'password' => Hash::make($plainPassword),
        ]);

        $credentials->push([
            'role' => $role,
            'email' => $user->email,
            'password' => $plainPassword,
        ]);

        Log::info("Seeded user credentials: role={$role} email={$user->email} password={$plainPassword}");

        return $user;
    }

    private function generatePlainPassword(string $prefix, int $index): string
    {
        return $prefix . fake()->numberBetween(1000, 9999) . strtoupper(Str::random(2)) . $index;
    }

    private function displayCredentials(Collection $credentials): void
    {
        if ($this->command) {

            $this->command->info('Seeded test credentials:');

            $this->command->table(
                ['Role', 'Email', 'Password'],
                $credentials
                    ->map(fn(array $credential) => [
                        $credential['role'],
                        $credential['email'],
                        $credential['password'],
                    ])
                    ->all()
            );
        }
    }
}