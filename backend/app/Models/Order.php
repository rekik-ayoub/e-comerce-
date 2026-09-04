<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'status',
        'total',
        'delivery_address',
        'delivery_lat',
        'delivery_lng',
        'notes',
        'points_earned',
    ];

    protected $casts = [
        'total' => 'float',
        'delivery_lat' => 'float',
        'delivery_lng' => 'float',
        'points_earned' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }
}
