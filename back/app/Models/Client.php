<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Client extends Model
{
    use HasFactory;

    protected $primaryKey = 'user_id';
    public $incrementing = false;
    protected $keyType = 'int';

    protected $fillable = [
        'user_id',
        'address',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function reservations()
    {
        return $this->hasMany(Reservation::class, 'client_id', 'user_id');
    }

    public function avis()
    {
        return $this->hasMany(Avis::class, 'client_id', 'user_id');
    }
}
