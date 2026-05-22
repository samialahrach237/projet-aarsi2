<?php

namespace App\Http\Controllers;

use App\Models\Service;
use App\Models\Prestataire;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class ServiceController extends Controller
{
    /**
     * Show all services for the provider.
     */
    public function index(): View
    {
        $prestataire = auth()->user()->prestataire;

        if (!$prestataire) {
            abort(404, 'Prestataire profile not found');
        }

        $services = $prestataire->services()->paginate(10);

        return view('provider.services.index', compact('services', 'prestataire'));
    }

    /**
     * Show create service form.
     */
    public function create(): View
    {
        $prestataire = auth()->user()->prestataire;

        if (!$prestataire) {
            abort(404, 'Prestataire profile not found');
        }

        return view('provider.services.create', compact('prestataire'));
    }

    /**
     * Store a new service.
     */
    public function store(): RedirectResponse
    {
        $prestataire = auth()->user()->prestataire;

        if (!$prestataire) {
            abort(404, 'Prestataire profile not found');
        }

        $validated = request()->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'duration' => 'required|integer|min:1',
            'category' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Handle image upload
        if (request()->hasFile('image')) {
            $path = request()->file('image')->store('services', 'public');
            $validated['image'] = $path;
        }

        $validated['prestataire_id'] = auth()->id();

        Service::create($validated);

        return redirect()->route('provider.services.index')->with('success', 'Service created successfully');
    }

    /**
     * Show edit service form.
     */
    public function edit(Service $service): View
    {
        $prestataire = auth()->user()->prestataire;

        if (!$prestataire || $service->prestataire_id != auth()->id()) {
            abort(403, 'Unauthorized');
        }

        return view('provider.services.edit', compact('service', 'prestataire'));
    }

    /**
     * Update a service.
     */
    public function update(Service $service): RedirectResponse
    {
        if ($service->prestataire_id != auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $validated = request()->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'duration' => 'required|integer|min:1',
            'category' => 'required|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        // Handle image upload
        if (request()->hasFile('image')) {
            $path = request()->file('image')->store('services', 'public');
            $validated['image'] = $path;
        }

        $service->update($validated);

        return redirect()->route('provider.services.index')->with('success', 'Service updated successfully');
    }

    /**
     * Delete a service.
     */
    public function destroy(Service $service): RedirectResponse
    {
        if ($service->prestataire_id != auth()->id()) {
            abort(403, 'Unauthorized');
        }

        $service->delete();

        return redirect()->route('provider.services.index')->with('success', 'Service deleted successfully');
    }
}
