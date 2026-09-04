<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Event;
use App\Models\Review;
use App\Models\Contact;
use App\Models\LoyaltySetting;
use Illuminate\Http\Request;

class ContentController extends Controller
{
    public function events()
    {
        $events = Event::where('active', true)
            ->where('event_date', '>=', now())
            ->orderBy('event_date')
            ->get();

        return response()->json($events);
    }

    public function reviews(Request $request)
    {
        $query = Review::where('approved', true)->with(['user:id,name', 'product:id,name_fr,name_en']);

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('product_id')) {
            $query->where('product_id', $request->product_id);
        }

        return response()->json($query->latest()->get());
    }

    public function storeReview(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:product,cafe',
            'product_id' => 'nullable|required_if:type,product|exists:products,id',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:5|max:1000',
        ]);

        $review = Review::create([
            'user_id' => $request->user()->id,
            'type' => $validated['type'],
            'product_id' => $validated['product_id'] ?? null,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'],
            'approved' => false, // Requires admin approval
        ]);

        return response()->json([
            'message' => 'Merci pour votre avis ! Il sera visible dès validation par notre équipe.',
            'review' => $review,
        ], 201);
    }

    public function storeContact(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'email' => 'required|email|max:150',
            'subject' => 'required|string|max:200',
            'message' => 'required|string|max:2000',
        ]);

        $contact = Contact::create($validated);

        return response()->json([
            'message' => 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
            'contact' => $contact,
        ], 201);
    }

    public function loyaltyInfo(Request $request)
    {
        $setting = LoyaltySetting::first();
        $user = $request->user();

        $target = $setting ? $setting->target_score : 50;
        $pointsPerOrder = $setting ? $setting->points_per_order : 10;
        $currentPoints = $user ? $user->points : 0;
        $percentage = min(100, round(($currentPoints / max(1, $target)) * 100));

        return response()->json([
            'current_points' => $currentPoints,
            'target_score' => $target,
            'points_per_order' => $pointsPerOrder,
            'percentage' => $percentage,
            'has_reached' => $currentPoints >= $target,
            'reward_fr' => $setting->reward_description_fr ?? 'Un café offert !',
            'reward_en' => $setting->reward_description_en ?? 'A free coffee!',
        ]);
    }
}
