<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoyaltySetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'points_per_order',
        'target_score',
        'reward_description_fr',
        'reward_description_en',
    ];

    protected $casts = [
        'points_per_order' => 'integer',
        'target_score' => 'integer',
    ];
}
