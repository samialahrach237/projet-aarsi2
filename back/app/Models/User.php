<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Client;
use App\Models\Prestataire;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'city',
        'photo_profile',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    protected $appends = [
        'photo_url',
    ];

    public function client()
    {
        return $this->hasOne(Client::class, 'user_id');
    }

    public function prestataire()
    {
        return $this->hasOne(Prestataire::class, 'user_id');
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class, 'client_id');
    }

    public function avis()
    {
        return $this->hasMany(Avis::class, 'client_id');
    }

    public function getPhotoUrlAttribute(): ?string
    {
        if (!$this->photo_profile) {
            return null;
        }

        return asset('storage/' . ltrim($this->photo_profile, '/'));
    }
}
