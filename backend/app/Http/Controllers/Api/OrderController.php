<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\LoyaltySetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with(['items.product'])
            ->latest()
            ->get();

        return response()->json($orders);
    }

    public function show(Request $request, $id)
    {
        $order = Order::where('user_id', $request->user()->id)
            ->with(['items.product'])
            ->findOrFail($id);

        return response()->json($order);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'delivery_address' => 'nullable|string',
            'delivery_lat' => 'nullable|numeric',
            'delivery_lng' => 'nullable|numeric',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();

        return DB::transaction(function () use ($validated, $user) {
            $loyaltySetting = LoyaltySetting::first();
            $pointsPerOrder = $loyaltySetting ? $loyaltySetting->points_per_order : 10;
            $targetScore = $loyaltySetting ? $loyaltySetting->target_score : 50;

            $total = 0;
            $itemsData = [];

            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $subtotal = $product->price * $item['quantity'];
                $total += $subtotal;

                $itemsData[] = [
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->price,
                ];
            }

            $order = Order::create([
                'user_id' => $user->id,
                'status' => 'pending',
                'total' => $total,
                'delivery_address' => $validated['delivery_address'] ?? null,
                'delivery_lat' => $validated['delivery_lat'] ?? null,
                'delivery_lng' => $validated['delivery_lng'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'points_earned' => $pointsPerOrder,
            ]);

            foreach ($itemsData as $iData) {
                $order->items()->create($iData);
            }

            // Update user points
            $oldPoints = $user->points;
            $newPoints = $oldPoints + $pointsPerOrder;
            $reachedTarget = ($oldPoints < $targetScore) && ($newPoints >= $targetScore);

            $user->update(['points' => $newPoints]);

            return response()->json([
                'message' => 'Commande passée avec succès (Paiement à la livraison)',
                'order' => $order->load('items.product'),
                'points_earned' => $pointsPerOrder,
                'current_points' => $newPoints,
                'target_score' => $targetScore,
                'reached_target' => $reachedTarget,
                'reward_info' => $reachedTarget ? [
                    'fr' => $loyaltySetting->reward_description_fr ?? 'Un café offert !',
                    'en' => $loyaltySetting->reward_description_en ?? 'A free coffee!',
                ] : null,
            ], 201);
        });
    }
}
