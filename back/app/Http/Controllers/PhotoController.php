<?php

namespace App\Http\Controllers;

use App\Models\Photo;
use App\Models\Prestataire;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;
use Illuminate\Support\Facades\Storage;

class PhotoController extends Controller
{
    /**
     * Show all photos for the provider.
     */
    public function index(): View
    {
        $prestataire = auth()->user()->prestataire;

        if (!$prestataire) {
            abort(404, 'Prestataire profile not found');
        }

        $photos = $prestataire->photos()->paginate(12);

        return view('provider.photos.index', compact('photos', 'prestataire'));
    }

    /**
     * Show upload photo form.
     */
    public function create(): View
    {
        $prestataire = auth()->user()->prestataire;

        if (!$prestataire) {
            abort(404, 'Prestataire profile not found');
        }

        return view('provider.photos.create', compact('prestataire'));
    }

    /**
     * Store uploaded photo.
     */
    public function store(): RedirectResponse
    {
        $prestataire = auth()->user()->prestataire;

        if (!$prestataire) {
            abort(404, 'Prestataire profile not found');
        }

        $validated = request()->validate([
            'photos' => 'required',
            'photos.*' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120',
        ]);

        if (request()->hasFile('photos')) {
            foreach (request()->file('photos') as $file) {
                $path = $file->store('photos', 'public');
                Photo::create([
                    'prestataire_id' => auth()->id(),
                    'path' => $path,
                ]);
            }
        }

        return redirect()->route('provider.photos.index')->with('success', 'Photos uploaded successfully');
    }

    /**
     * Delete a photo.
     */
    public function destroy(Photo $photo): RedirectResponse
    {
        if ($photo->prestataire_id != auth()->id()) {
            abort(403, 'Unauthorized');
        }

        // Delete file from storage
        if ($photo->path) {
            Storage::disk('public')->delete($photo->path);
        }

        $photo->delete();

        return redirect()->back()->with('success', 'Photo deleted successfully');
    }

    /**
     * Set photo as profile picture.
     */
    public function setAsProfile(Photo $photo): RedirectResponse
    {
        if ($photo->prestataire_id != auth()->id()) {
            abort(403, 'Unauthorized');
        }

        auth()->user()->prestataire()->update(['photo' => $photo->path]);

        return redirect()->back()->with('success', 'Profile photo updated');
    }
}
