<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'image',
    ];

    protected $appends = [
        'image_url',
    ];

    public function services()
    {
        return $this->hasMany(Service::class);
    }

    public function getImageUrlAttribute(): string
    {
        if (!$this->image) {
            return '/images/hero.jpg';
        }

        if (Str::startsWith($this->image, ['http://', 'https://', '/images/', '/storage/'])) {
            return $this->image;
        }

        return asset('storage/' . ltrim($this->image, '/'));
    }
}
