<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Photo extends Model
{
    use HasFactory;

    protected $fillable = [
        'prestataire_id',
        'path',
    ];

    protected $appends = [
        'url',
    ];

    public function prestataire()
    {
        return $this->belongsTo(Prestataire::class, 'prestataire_id', 'user_id');
    }

    public function getUrlAttribute(): string
    {
        return asset('storage/' . ltrim($this->path, '/'));
    }
}
