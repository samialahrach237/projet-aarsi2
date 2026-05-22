<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;

    protected $fillable = [
        'prestataire_id',
        'category_id',
        'name',
        'description',
        'price',
        'duration',
        'category',
        'image',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    protected $appends = [
        'image_url',
    ];

    public function prestataire()
    {
        return $this->belongsTo(Prestataire::class, 'prestataire_id', 'user_id');
    }

    public function categoryModel()
    {
        return $this->belongsTo(Category::class, 'category_id');
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class, 'service_id');
    }

    public function avis()
    {
        return $this->hasMany(Avis::class, 'service_id');
    }

    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image) {
            return null;
        }

        return asset('storage/' . ltrim($this->image, '/'));
    }
}
