<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PrestataireController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\AvisController;
use App\Http\Controllers\Api\PhotoController;
use App\Http\Controllers\Api\CalendarController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ProviderDashboardController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/prestataires', [PrestataireController::class, 'index']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/search', [ServiceController::class, 'search']);
Route::get('/services/{service}', [ServiceController::class, 'show']);
Route::get('/reviews', [AvisController::class, 'publicIndex']);
Route::get('/photos/{prestataireId}', [PhotoController::class, 'index']);
Route::get('/calendar', [CalendarController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [UserController::class, 'show']);
    Route::put('/user', [UserController::class, 'update']);
    Route::get('/user/photo-profile', [UserController::class, 'photoProfile']);
    Route::post('/user/photo-profile', [UserController::class, 'uploadPhotoProfile']);

    Route::prefix('/client')->middleware('role:client')->group(function () {
        Route::get('/reservations', [ReservationController::class, 'index']);
        Route::get('/avis', [AvisController::class, 'index']);
        Route::get('/profile', [UserController::class, 'show']);
        Route::put('/profile', [UserController::class, 'update']);
        Route::get('/profile/photo', [UserController::class, 'photoProfile']);
        Route::post('/profile/photo', [UserController::class, 'uploadPhotoProfile']);
    });

    Route::get('/my-services', [ServiceController::class, 'myServices'])->middleware('role:prestataire');
    Route::post('/services', [ServiceController::class, 'store'])->middleware('role:prestataire');
    Route::put('/services/{service}', [ServiceController::class, 'update'])->middleware('role:prestataire');
    Route::delete('/services/{service}', [ServiceController::class, 'destroy']);

    Route::get('/my-reservations', [ReservationController::class, 'myReservations']);
    Route::get('/reservations', [ReservationController::class, 'index']);
    Route::post('/reservations', [ReservationController::class, 'store'])->middleware('role:client');
    Route::delete('/reservations/{reservation}', [ReservationController::class, 'destroy'])->middleware('role:client');
    Route::post('/accept-reservation/{reservation}', [ReservationController::class, 'acceptReservation'])
        ->middleware('role:prestataire');
    Route::post('/refuse-reservation/{reservation}', [ReservationController::class, 'refuseReservation'])
        ->middleware('role:prestataire');
    Route::put('/reservations/{reservation}/status', [ReservationController::class, 'updateStatus'])
        ->middleware('role:prestataire');

    Route::get('/avis', [AvisController::class, 'index'])->middleware('role:client');
    Route::post('/avis', [AvisController::class, 'store'])->middleware('role:client');
    Route::put('/avis/{avis}', [AvisController::class, 'update'])->middleware('role:client');
    Route::delete('/avis/{avis}', [AvisController::class, 'destroy'])->middleware('role:client');

    Route::post('/photos', [PhotoController::class, 'store'])->middleware('role:prestataire');
    Route::put('/photos/{photo}', [PhotoController::class, 'update'])->middleware('role:prestataire');
    Route::delete('/photos/{photo}', [PhotoController::class, 'destroy'])->middleware('role:prestataire');

    Route::prefix('/provider')->middleware('role:prestataire')->group(function () {
        Route::get('/dashboard', [ProviderDashboardController::class, 'overview']);
        Route::get('/statistics', [ProviderDashboardController::class, 'statistics']);
        Route::get('/reservations/recent', [ProviderDashboardController::class, 'recentReservations']);
        Route::get('/photo-profile', [UserController::class, 'photoProfile']);
        Route::post('/photo-profile', [UserController::class, 'uploadPhotoProfile']);
        Route::get('/services', [ServiceController::class, 'providerIndex']);
        Route::post('/services', [ServiceController::class, 'store']);
        Route::put('/services/{service}', [ServiceController::class, 'update']);
        Route::delete('/services/{service}', [ServiceController::class, 'destroy']);

        Route::get('/reservations', [ReservationController::class, 'providerIndex']);
        Route::put('/reservations/{reservation}/status', [ReservationController::class, 'updateStatus']);
        Route::post('/reservations/{reservation}/accept', [ReservationController::class, 'acceptReservation']);
        Route::post('/reservations/{reservation}/refuse', [ReservationController::class, 'refuseReservation']);

        Route::get('/photos', [PhotoController::class, 'myPhotos']);
        Route::post('/photos', [PhotoController::class, 'store']);
        Route::put('/photos/{photo}', [PhotoController::class, 'update']);
        Route::delete('/photos/{photo}', [PhotoController::class, 'destroy']);

        Route::get('/calendar', [CalendarController::class, 'providerIndex']);
        Route::get('/calendrier', [CalendarController::class, 'providerIndex']);
        Route::post('/calendar', [CalendarController::class, 'store']);
        Route::put('/calendar/{calendar}', [CalendarController::class, 'update']);
        Route::delete('/calendar/{calendar}', [CalendarController::class, 'destroy']);
    });

    Route::post('/calendar', [CalendarController::class, 'store'])->middleware('role:prestataire');
    Route::put('/calendar/{calendar}', [CalendarController::class, 'update'])->middleware('role:prestataire');
    Route::delete('/calendar/{calendar}', [CalendarController::class, 'destroy'])->middleware('role:prestataire');

    Route::prefix('admin')->middleware('role:admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/users', [AdminController::class, 'index']);
        Route::get('/users/create', [AdminController::class, 'create']);
        Route::post('/users', [AdminController::class, 'store']);
        Route::get('/users/{user}/edit', [AdminController::class, 'edit']);
        Route::put('/users/{user}', [AdminController::class, 'update']);
        Route::patch('/users/{user}', [AdminController::class, 'update']);
        Route::get('/prestataires/pending', [AdminController::class, 'pendingPrestataires']);
        Route::post('/prestataires/{id}/validate', [AdminController::class, 'validatePrestataire']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
    });
});
