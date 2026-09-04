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
            'use_free_coffee' => 'nullable|boolean',
            'voucher_code' => 'nullable|string',
        ]);

        $user = $request->user();

        return DB::transaction(function () use ($validated, $user) {
            $loyaltySetting = LoyaltySetting::first();
            $pointsPerOrder = $loyaltySetting ? $loyaltySetting->points_per_order : 10;
            $targetScore = $loyaltySetting ? $loyaltySetting->target_score : 50;

            $isFreeCoffeeRequested = !empty($validated['use_free_coffee']) 
                || (isset($validated['voucher_code']) && strtoupper(trim($validated['voucher_code'])) === 'FREE-COFFEE-BAYOU');

            $total = 0;
            $itemsData = [];
            $freeCoffeeApplied = false;

            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $unitPrice = $product->price;

                // If free coffee requested, discount 1 coffee to 0 DT
                if ($isFreeCoffeeRequested && !$freeCoffeeApplied && ($product->id == 1 || $product->id == 2 || $product->category_id == 1)) {
                    $qty = $item['quantity'];
                    if ($qty == 1) {
                        $unitPrice = 0;
                        $freeCoffeeApplied = true;
                    } else {
                        $itemsData[] = [
                            'product_id' => $product->id,
                            'quantity' => 1,
                            'unit_price' => 0,
                        ];
                        $itemsData[] = [
                            'product_id' => $product->id,
                            'quantity' => $qty - 1,
                            'unit_price' => $product->price,
                        ];
                        $total += $product->price * ($qty - 1);
                        $freeCoffeeApplied = true;
                        continue;
                    }
                }

                $subtotal = $unitPrice * $item['quantity'];
                $total += $subtotal;

                $itemsData[] = [
                    'product_id' => $product->id,
                    'quantity' => $item['quantity'],
                    'unit_price' => $unitPrice,
                ];
            }

            // If user requested free coffee but didn't have coffee in cart, automatically add the signature free coffee at 0 DT!
            if ($isFreeCoffeeRequested && !$freeCoffeeApplied) {
                $freeProduct = Product::find(1) ?? Product::first();
                if ($freeProduct) {
                    $itemsData[] = [
                        'product_id' => $freeProduct->id,
                        'quantity' => 1,
                        'unit_price' => 0,
                    ];
                    $freeCoffeeApplied = true;
                }
            }

            $orderNotes = trim(($validated['notes'] ?? '') . ($freeCoffeeApplied ? ' [🎁 Café Gratuit Fidélité Inclus - Code FREE-COFFEE-BAYOU]' : ''));

            $order = Order::create([
                'user_id' => $user->id,
                'status' => 'pending',
                'total' => $total,
                'delivery_address' => $validated['delivery_address'] ?? null,
                'delivery_lat' => $validated['delivery_lat'] ?? null,
                'delivery_lng' => $validated['delivery_lng'] ?? null,
                'notes' => $orderNotes ?: null,
                'points_earned' => $pointsPerOrder,
            ]);

            foreach ($itemsData as $iData) {
                $order->items()->create($iData);
            }

            // Update user points
            if ($freeCoffeeApplied) {
                // Free coffee used -> Reset counter to 0, then add points from this new order (+10)
                $newPoints = $pointsPerOrder;
                $user->update(['points' => $newPoints]);
                $reachedTarget = false;
            } else {
                $oldPoints = $user->points;
                $newPoints = $oldPoints + $pointsPerOrder;
                $reachedTarget = ($oldPoints < $targetScore) && ($newPoints >= $targetScore);
                $user->update(['points' => $newPoints]);
            }

            return response()->json([
                'message' => $freeCoffeeApplied 
                    ? 'Commande validée avec votre Café Offert ! Votre compteur a été remis à 0.' 
                    : 'Commande passée avec succès (Paiement à la livraison)',
                'order' => $order->load('items.product'),
                'points_earned' => $pointsPerOrder,
                'current_points' => $newPoints,
                'target_score' => $targetScore,
                'reached_target' => $reachedTarget,
                'free_coffee_applied' => $freeCoffeeApplied,
                'reward_info' => $reachedTarget ? [
                    'fr' => $loyaltySetting->reward_description_fr ?? 'Un café offert !',
                    'en' => $loyaltySetting->reward_description_en ?? 'A free coffee!',
                ] : null,
            ], 201);
        });
    }
}
