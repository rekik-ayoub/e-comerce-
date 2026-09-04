<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BirthdaySlot extends Model
{
    use HasFactory;

    protected $fillable = [
        'date',
        'time',
        'max_capacity',
        'current_bookings',
        'is_available',
    ];

    protected $casts = [
        'date' => 'date',
        'max_capacity' => 'integer',
        'current_bookings' => 'integer',
        'is_available' => 'boolean',
    ];

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
}
