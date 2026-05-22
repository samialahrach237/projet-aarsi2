<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProviderDashboardController;
use App\Http\Controllers\ServiceController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\PhotoController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});

// Provider Dashboard Routes (Protected by auth middleware)
Route::middleware('auth')->prefix('provider-dashboard')->name('provider.')->group(function () {
    // Dashboard overview
    Route::get('/', [ProviderDashboardController::class, 'index'])->name('index');
    Route::get('/profile', [ProviderDashboardController::class, 'profile'])->name('profile');
    Route::post('/profile', [ProviderDashboardController::class, 'updateProfile'])->name('profile.update');

    // Services
    Route::resource('services', ServiceController::class);

    // Reservations
    Route::prefix('reservations')->name('reservations.')->group(function () {
        Route::get('/', [ReservationController::class, 'index'])->name('index');
        Route::get('/{reservation}', [ReservationController::class, 'show'])->name('show');
        Route::post('/{reservation}/accept', [ReservationController::class, 'accept'])->name('accept');
        Route::post('/{reservation}/reject', [ReservationController::class, 'reject'])->name('reject');
        Route::post('/{reservation}/complete', [ReservationController::class, 'complete'])->name('complete');
        Route::post('/{reservation}/cancel', [ReservationController::class, 'cancel'])->name('cancel');
    });

    // Photos
    Route::resource('photos', PhotoController::class);
    Route::post('photos/{photo}/set-profile', [PhotoController::class, 'setAsProfile'])->name('photos.setAsProfile');
});
