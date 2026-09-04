<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    use HasFactory;

    protected $fillable = [
        'title_fr',
        'title_en',
        'description_fr',
        'description_en',
        'event_date',
        'image',
        'active',
    ];

    protected $casts = [
        'event_date' => 'datetime',
        'active' => 'boolean',
    ];
}
