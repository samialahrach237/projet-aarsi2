<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use App\Models\Prestataire;

class CreatePrestastaireOnLogin
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(Login $event): void
    {
        $user = $event->user;

        // Only create prestataire for users with 'prestataire' role
        if ($user->role === 'prestataire') {
            // Create prestataire record if it doesn't exist
            if (!$user->prestataire) {
                Prestataire::create([
                    'user_id' => $user->id,
                    'nomEntreprise' => $user->name,
                    'description' => '',
                    'adresse' => $user->city ?? '',
                ]);
            }
        }
    }
}
