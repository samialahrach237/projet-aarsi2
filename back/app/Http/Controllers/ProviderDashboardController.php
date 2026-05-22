<?php

namespace App\Http\Controllers;

use App\Models\Prestataire;
use App\Models\Service;
use App\Models\Reservation;
use Illuminate\View\View;

class ProviderDashboardController extends Controller
{
    /**
     * Show the provider dashboard.
     */
    public function index(): View
    {
        $prestataire = auth()->user()->prestataire;

        if (!$prestataire) {
            abort(404, 'Prestataire profile not found');
        }

        $stats = [
            'total_services' => $prestataire->services()->count(),
            'total_reservations' => Reservation::whereHas('service', function ($query) {
                $query->where('prestataire_id', auth()->id());
            })->count(),
            'pending_reservations' => Reservation::whereHas('service', function ($query) {
                $query->where('prestataire_id', auth()->id());
            })->where('status', 'pending')->count(),
        ];

        $latest_reservations = Reservation::whereHas('service', function ($query) {
            $query->where('prestataire_id', auth()->id());
        })
            ->with(['service', 'client.user'])
            ->latest()
            ->take(5)
            ->get();

        return view('provider.dashboard.index', compact('prestataire', 'stats', 'latest_reservations'));
    }

    /**
     * Show prestataire profile.
     */
    public function profile(): View
    {
        $prestataire = auth()->user()->prestataire;

        if (!$prestataire) {
            abort(404, 'Prestataire profile not found');
        }

        return view('provider.dashboard.profile', compact('prestataire'));
    }

    /**
     * Update prestataire profile.
     */
    public function updateProfile()
    {
        $prestataire = auth()->user()->prestataire;

        if (!$prestataire) {
            abort(404, 'Prestataire profile not found');
        }

        $validated = request()->validate([
            'nomEntreprise' => 'required|string|max:255',
            'description' => 'nullable|string',
            'adresse' => 'required|string|max:255',
            'ville' => 'required|string|max:255',
        ]);

        // Handle photo upload
        if (request()->hasFile('photo')) {
            $path = request()->file('photo')->store('prestataire-photos', 'public');
            $validated['photo'] = $path;
        }

        $prestataire->update($validated);

        return redirect()->route('provider.profile')->with('success', 'Profile updated successfully');
    }
}
