<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id',
        'prestataire_id',
        'service_id',
        'reservation_date',
        'reservation_time',
        'guests',
        'phone',
        'city',
        'date',
        'start_time',
        'end_time',
        'message',
        'status',
    ];

    protected $casts = [
        'date' => 'date',
        'reservation_date' => 'date',
        'guests' => 'integer',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id', 'user_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class, 'service_id');
    }

    public function prestataire()
    {
        return $this->belongsTo(Prestataire::class, 'prestataire_id', 'user_id');
    }
}
