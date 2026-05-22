<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class ReservationController extends Controller
{
    /**
     * Show all reservations for the provider's services.
     */
    public function index(): View
    {
        $prestataire = auth()->user()->prestataire;

        if (!$prestataire) {
            abort(404, 'Prestataire profile not found');
        }

        $reservations = Reservation::whereHas('service', function ($query) {
            $query->where('prestataire_id', auth()->id());
        })
            ->with(['service', 'client.user'])
            ->latest()
            ->paginate(15);

        return view('provider.reservations.index', compact('reservations', 'prestataire'));
    }

    /**
     * Show reservation details.
     */
    public function show(Reservation $reservation): View
    {
        if ($reservation->service->prestataire_id != auth()->id()) {
            abort(403, 'Unauthorized');
        }

        return view('provider.reservations.show', compact('reservation'));
    }

    /**
     * Accept a reservation.
     */
    public function accept(Reservation $reservation): RedirectResponse
    {
        if ($reservation->service->prestataire_id != auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $reservation->update(['status' => 'accepted']);

        return redirect()->back()->with('success', 'Reservation accepted');
    }

    /**
     * Reject a reservation.
     */
    public function reject(Reservation $reservation): RedirectResponse
    {
        if ($reservation->service->prestataire_id != auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $reservation->update(['status' => 'rejected']);

        return redirect()->back()->with('success', 'Reservation rejected');
    }

    /**
     * Mark reservation as completed.
     */
    public function complete(Reservation $reservation): RedirectResponse
    {
        if ($reservation->service->prestataire_id != auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $reservation->update(['status' => 'completed']);

        return redirect()->back()->with('success', 'Reservation marked as completed');
    }

    /**
     * Mark reservation as cancelled.
     */
    public function cancel(Reservation $reservation): RedirectResponse
    {
        if ($reservation->service->prestataire_id != auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $reservation->update(['status' => 'cancelled']);

        return redirect()->back()->with('success', 'Reservation cancelled');
    }
}
