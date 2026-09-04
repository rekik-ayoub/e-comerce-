<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\BirthdaySlot;
use App\Models\BirthdayMenu;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    public function birthdaySlots(Request $request)
    {
        $slots = BirthdaySlot::where('is_available', true)
            ->where('date', '>=', now()->format('Y-m-d'))
            ->orderBy('date')
            ->orderBy('time')
            ->get();

        return response()->json($slots);
    }

    public function birthdayMenus()
    {
        return response()->json(BirthdayMenu::where('active', true)->get());
    }

    public function userReservations(Request $request)
    {
        $reservations = Reservation::where('user_id', $request->user()->id)
            ->with(['birthdaySlot', 'birthdayMenu'])
            ->latest()
            ->get();

        return response()->json($reservations);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:table,birthday',
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required|string',
            'guests' => 'required|integer|min:1|max:50',
            'notes' => 'nullable|string',
            'birthday_slot_id' => 'nullable|exists:birthday_slots,id',
            'birthday_menu_id' => 'nullable|exists:birthday_menus,id',
            'birthday_person_name' => 'nullable|string|max:100',
        ]);

        $reservation = Reservation::create([
            'user_id' => $request->user()->id,
            'type' => $validated['type'],
            'date' => $validated['date'],
            'time' => $validated['time'],
            'guests' => $validated['guests'],
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
            'birthday_slot_id' => $validated['birthday_slot_id'] ?? null,
            'birthday_menu_id' => $validated['birthday_menu_id'] ?? null,
            'birthday_person_name' => $validated['birthday_person_name'] ?? null,
        ]);

        // If birthday slot booked, update slot current_bookings
        if (!empty($validated['birthday_slot_id'])) {
            $slot = BirthdaySlot::find($validated['birthday_slot_id']);
            if ($slot) {
                $slot->increment('current_bookings');
                if ($slot->current_bookings >= $slot->max_capacity) {
                    $slot->update(['is_available' => false]);
                }
            }
        }

        return response()->json([
            'message' => 'Réservation enregistrée avec succès. En attente de confirmation.',
            'reservation' => $reservation->load(['birthdaySlot', 'birthdayMenu']),
        ], 201);
    }
}
