<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'type',
        'date',
        'time',
        'guests',
        'notes',
        'status',
        'birthday_slot_id',
        'birthday_menu_id',
        'birthday_person_name',
    ];

    protected $casts = [
        'date' => 'date',
        'guests' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function birthdaySlot()
    {
        return $this->belongsTo(BirthdaySlot::class);
    }

    public function birthdayMenu()
    {
        return $this->belongsTo(BirthdayMenu::class);
    }
}
