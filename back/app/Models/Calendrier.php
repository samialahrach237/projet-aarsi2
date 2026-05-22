<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Calendrier extends Model
{
    use HasFactory;

    protected $fillable = [
        'prestataire_id',
        'date',
        'available',
    ];

    protected $casts = [
        'date' => 'date',
        'available' => 'boolean',
    ];

    public function prestataire()
    {
        return $this->belongsTo(Prestataire::class, 'prestataire_id', 'user_id');
    }
}
