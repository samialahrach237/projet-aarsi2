<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Avis extends Model
{
    use HasFactory;

    protected $table = 'avis';

    protected $fillable = [
        'client_id',
        'service_id',
        'rating',
        'comment',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class, 'client_id', 'user_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class, 'service_id');
    }
}
