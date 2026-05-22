<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Prestataire extends Model
{
    use HasFactory;

    protected $primaryKey = 'user_id';
    public $incrementing = false;
    protected $keyType = 'int';

    protected $fillable = [
        'user_id',
        'nomEntreprise',
        'slug',
        'description',
        'adresse',
        'is_validated',
        'photo',
        'ville',
    ];

    protected $casts = [
        'is_validated' => 'boolean',
    ];

    protected $appends = [
        'photo_url',
        'photo_profile_url',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function services()
    {
        return $this->hasMany(Service::class, 'prestataire_id', 'user_id');
    }

    public function photos()
    {
        return $this->hasMany(Photo::class, 'prestataire_id', 'user_id');
    }

    public function calendriers()
    {
        return $this->hasMany(Calendrier::class, 'prestataire_id', 'user_id');
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class, 'prestataire_id', 'user_id');
    }

    public function getPhotoUrlAttribute(): ?string
    {
        if (!$this->photo) {
            return null;
        }

        return asset('storage/' . ltrim($this->photo, '/'));
    }

    public function getPhotoProfileUrlAttribute(): ?string
    {
        return $this->user?->photo_url;
    }
}
