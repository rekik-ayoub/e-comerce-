<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BirthdayMenu extends Model
{
    use HasFactory;

    protected $fillable = [
        'name_fr',
        'name_en',
        'description_fr',
        'description_en',
        'price',
        'image',
        'active',
    ];

    protected $casts = [
        'price' => 'float',
        'active' => 'boolean',
    ];

    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
}
