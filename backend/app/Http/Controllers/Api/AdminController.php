<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\Order;
use App\Models\Reservation;
use App\Models\Event;
use App\Models\BirthdaySlot;
use App\Models\BirthdayMenu;
use App\Models\Review;
use App\Models\Contact;
use App\Models\LoyaltySetting;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    // 1. Dashboard Statistics
    public function stats()
    {
        return response()->json([
            'total_orders' => Order::count(),
            'pending_orders' => Order::where('status', 'pending')->count(),
            'total_customers' => User::where('role', 'customer')->count(),
            'total_reservations' => Reservation::count(),
            'pending_reservations' => Reservation::where('status', 'pending')->count(),
            'confirmed_reservations' => Reservation::where('status', 'confirmed')->count(),
            'rejected_reservations' => Reservation::where('status', 'rejected')->count(),
            'total_products' => Product::count(),
            'total_events' => Event::count(),
            'pending_reviews' => Review::where('approved', false)->count(),
            'unread_contacts' => Contact::where('read', false)->count(),
            'recent_orders' => Order::with(['user:id,name,email', 'items.product'])->latest()->take(5)->get(),
        ]);
    }

    private function processImage(Request $request, $currentImage = null)
    {
        if ($request->hasFile('image_file')) {
            $file = $request->file('image_file');
            $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
            $file->move(public_path('uploads'), $filename);
            return '/uploads/' . $filename;
        }

        $image = $request->input('image');
        if ($image && str_starts_with($image, 'data:image')) {
            if (preg_match('/^data:image\/(\w+);base64,/', $image, $type)) {
                $data = substr($image, strpos($image, ',') + 1);
                $type = strtolower($type[1]);
                if (!in_array($type, ['jpg', 'jpeg', 'gif', 'png', 'webp'])) {
                    $type = 'jpg';
                }
                $data = base64_decode($data);
                if ($data !== false) {
                    if (!file_exists(public_path('uploads'))) {
                        mkdir(public_path('uploads'), 0755, true);
                    }
                    $filename = time() . '_' . uniqid() . '.' . $type;
                    file_put_contents(public_path('uploads/' . $filename), $data);
                    return '/uploads/' . $filename;
                }
            }
        }

        return $image ?: $currentImage;
    }

    // 2. Products CRUD
    public function products()
    {
        return response()->json(Product::with('category')->latest()->get());
    }

    public function storeProduct(Request $request)
    {
        $validated = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name_fr' => 'required|string|max:150',
            'name_en' => 'required|string|max:150',
            'description_fr' => 'nullable|string',
            'description_en' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|string',
            'available' => 'boolean',
            'featured' => 'boolean',
        ]);

        $validated['image'] = $this->processImage($request);
        $product = Product::create($validated);
        return response()->json($product->load('category'), 201);
    }

    public function updateProduct(Request $request, $id)
    {
        $product = Product::findOrFail($id);
        $data = $request->all();
        if ($request->has('image') || $request->hasFile('image_file')) {
            $data['image'] = $this->processImage($request, $product->image);
        }
        $product->update($data);
        return response()->json($product->load('category'));
    }

    public function deleteProduct($id)
    {
        Product::findOrFail($id)->delete();
        return response()->json(['message' => 'Produit supprimé']);
    }

    // 3. Categories CRUD
    public function categories()
    {
        return response()->json(Category::withCount('products')->get());
    }

    public function storeCategory(Request $request)
    {
        $validated = $request->validate([
            'name_fr' => 'required|string|max:100',
            'name_en' => 'required|string|max:100',
            'image' => 'nullable|string',
            'active' => 'boolean',
        ]);

        $category = Category::create($validated);
        return response()->json($category, 201);
    }

    public function updateCategory(Request $request, $id)
    {
        $category = Category::findOrFail($id);
        $category->update($request->all());
        return response()->json($category);
    }

    public function deleteCategory($id)
    {
        Category::findOrFail($id)->delete();
        return response()->json(['message' => 'Catégorie supprimée']);
    }

    // 4. Orders Management
    public function orders()
    {
        return response()->json(Order::with(['user:id,name,email,phone', 'items.product'])->latest()->get());
    }

    public function updateOrderStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,accepted,rejected,preparing,delivered',
        ]);

        $order = Order::findOrFail($id);
        $order->update(['status' => $request->status]);

        return response()->json([
            'message' => 'Statut de la commande mis à jour',
            'order' => $order->load(['user', 'items.product']),
        ]);
    }

    public function deleteOrder($id)
    {
        $order = Order::findOrFail($id);
        $order->items()->delete();
        $order->delete();

        return response()->json(['message' => 'Commande supprimée avec succès']);
    }

    // 5. Reservations Management
    public function reservations()
    {
        return response()->json(Reservation::with(['user:id,name,email,phone', 'birthdaySlot', 'birthdayMenu'])->latest()->get());
    }

    public function updateReservationStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,rejected,cancelled',
        ]);

        $reservation = Reservation::findOrFail($id);
        $oldStatus = $reservation->status;
        $newStatus = $request->status;

        $reservation->update(['status' => $newStatus]);

        // If this is a birthday reservation, manage slot availability
        // Rule: max 2 confirmed anniversaire reservations per slot (date + time)
        if ($reservation->type === 'birthday') {
            $slot = null;
            if ($reservation->birthday_slot_id) {
                $slot = BirthdaySlot::find($reservation->birthday_slot_id);
            }
            if (!$slot) {
                $slot = BirthdaySlot::whereDate('date', $reservation->date)->where('time', $reservation->time)->first();
            }

            if ($slot) {
                // Count how many birthday reservations are confirmed for this slot
                $confirmedCount = Reservation::where('type', 'birthday')
                    ->where('status', 'confirmed')
                    ->where(function ($q) use ($slot) {
                        $q->where('birthday_slot_id', $slot->id)
                          ->orWhere(function ($sub) use ($slot) {
                              $sub->whereDate('date', $slot->date)->where('time', $slot->time);
                          });
                    })
                    ->count();

                $maxAllowed = $slot->max_capacity ?? 2;

                if ($confirmedCount >= $maxAllowed) {
                    // Slot is full (max 2 reached) — mark as unavailable
                    $slot->update(['is_available' => false, 'current_bookings' => $confirmedCount]);
                } else {
                    // Still space — keep available
                    $slot->update(['is_available' => true, 'current_bookings' => $confirmedCount]);
                }
            }
        }

        return response()->json([
            'message' => 'Statut de réservation mis à jour',
            'reservation' => $reservation->load(['user', 'birthdaySlot', 'birthdayMenu']),
        ]);
    }

    public function deleteReservation($id)
    {
        $reservation = Reservation::findOrFail($id);
        $slotId = $reservation->birthday_slot_id;
        $date = $reservation->date;
        $time = $reservation->time;
        $wasBirthday = ($reservation->type === 'birthday');

        $reservation->delete();

        // If this was a birthday reservation, recalculate the slot's booking and availability
        if ($wasBirthday) {
            $slot = null;
            if ($slotId) {
                $slot = BirthdaySlot::find($slotId);
            }
            if (!$slot && $date && $time) {
                $slot = BirthdaySlot::whereDate('date', $date)->where('time', $time)->first();
            }

            if ($slot) {
                $confirmedCount = Reservation::where('type', 'birthday')
                    ->where('status', 'confirmed')
                    ->where(function ($q) use ($slot) {
                        $q->where('birthday_slot_id', $slot->id)
                          ->orWhere(function ($sub) use ($slot) {
                              $sub->whereDate('date', $slot->date)->where('time', $slot->time);
                          });
                    })
                    ->count();

                $maxAllowed = $slot->max_capacity ?? 2;
                $slot->update([
                    'current_bookings' => $confirmedCount,
                    'is_available' => ($confirmedCount < $maxAllowed),
                ]);
            }
        }

        return response()->json(['message' => 'Réservation supprimée avec succès']);
    }

    // 6. Birthday Slots CRUD
    public function birthdaySlots()
    {
        return response()->json(BirthdaySlot::orderBy('date')->orderBy('time')->get());
    }

    public function storeBirthdaySlot(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'time' => 'required|string',
            'max_capacity' => 'nullable|integer|min:1',
            'is_available' => 'boolean',
        ]);

        // Default: max 2 anniversaires par créneau (date + heure)
        if (!isset($validated['max_capacity'])) {
            $validated['max_capacity'] = 2;
        }
        if (!isset($validated['is_available'])) {
            $validated['is_available'] = true;
        }
        $validated['current_bookings'] = 0;

        $slot = BirthdaySlot::create($validated);
        return response()->json($slot, 201);
    }

    public function updateBirthdaySlot(Request $request, $id)
    {
        $slot = BirthdaySlot::findOrFail($id);
        $slot->update($request->all());
        return response()->json($slot);
    }

    public function deleteBirthdaySlot($id)
    {
        BirthdaySlot::findOrFail($id)->delete();
        return response()->json(['message' => 'Créneau d\'anniversaire supprimé']);
    }

    // 7. Birthday Menus CRUD
    public function birthdayMenus()
    {
        return response()->json(BirthdayMenu::all());
    }

    public function storeBirthdayMenu(Request $request)
    {
        $validated = $request->validate([
            'name_fr' => 'required|string',
            'name_en' => 'required|string',
            'description_fr' => 'nullable|string',
            'description_en' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'image' => 'nullable|string',
            'active' => 'boolean',
        ]);

        $validated['image'] = $this->processImage($request);
        $menu = BirthdayMenu::create($validated);
        return response()->json($menu, 201);
    }

    public function updateBirthdayMenu(Request $request, $id)
    {
        $menu = BirthdayMenu::findOrFail($id);
        $data = $request->all();
        if ($request->has('image') || $request->hasFile('image_file')) {
            $data['image'] = $this->processImage($request, $menu->image);
        }
        $menu->update($data);
        return response()->json($menu);
    }

    public function deleteBirthdayMenu($id)
    {
        BirthdayMenu::findOrFail($id)->delete();
        return response()->json(['message' => 'Formule d\'anniversaire supprimée']);
    }

    // 8. Events CRUD
    public function events()
    {
        return response()->json(Event::latest('event_date')->get());
    }

    public function storeEvent(Request $request)
    {
        $validated = $request->validate([
            'title_fr' => 'required|string',
            'title_en' => 'required|string',
            'description_fr' => 'nullable|string',
            'description_en' => 'nullable|string',
            'event_date' => 'required|date',
            'image' => 'nullable|string',
            'active' => 'boolean',
        ]);

        if (!isset($validated['active'])) {
            $validated['active'] = true;
        }

        $validated['image'] = $this->processImage($request);
        $event = Event::create($validated);
        return response()->json($event, 201);
    }

    public function updateEvent(Request $request, $id)
    {
        $event = Event::findOrFail($id);
        $data = $request->all();
        if ($request->has('image') || $request->hasFile('image_file')) {
            $data['image'] = $this->processImage($request, $event->image);
        }
        $event->update($data);
        return response()->json($event);
    }

    public function deleteEvent($id)
    {
        Event::findOrFail($id)->delete();
        return response()->json(['message' => 'Événement supprimé']);
    }

    // 9. Reviews Moderation
    public function reviews()
    {
        return response()->json(Review::with(['user:id,name,email', 'product:id,name_fr'])->latest()->get());
    }

    public function toggleReviewApproval($id)
    {
        $review = Review::findOrFail($id);
        $review->update(['approved' => !$review->approved]);
        return response()->json([
            'message' => $review->approved ? 'Avis approuvé' : 'Avis masqué',
            'review' => $review,
        ]);
    }

    public function deleteReview($id)
    {
        Review::findOrFail($id)->delete();
        return response()->json(['message' => 'Avis supprimé']);
    }

    // 10. Contacts
    public function contacts()
    {
        return response()->json(Contact::latest()->get());
    }

    public function markContactRead($id)
    {
        $contact = Contact::findOrFail($id);
        $contact->update(['read' => true]);
        return response()->json($contact);
    }

    // 11. Loyalty Settings (Points Threshold & Reward)
    public function getLoyaltySettings()
    {
        $setting = LoyaltySetting::firstOrCreate(['id' => 1], [
            'points_per_order' => 10,
            'target_score' => 50,
            'reward_description_fr' => 'Un café offert !',
            'reward_description_en' => 'A free coffee!',
        ]);

        return response()->json($setting);
    }

    public function updateLoyaltySettings(Request $request)
    {
        $validated = $request->validate([
            'points_per_order' => 'required|integer|min:1',
            'target_score' => 'required|integer|min:5',
            'reward_description_fr' => 'required|string',
            'reward_description_en' => 'required|string',
        ]);

        $setting = LoyaltySetting::firstOrCreate(['id' => 1]);
        $setting->update($validated);

        return response()->json([
            'message' => 'Paramètres du programme fidélité mis à jour avec succès',
            'settings' => $setting,
        ]);
    }

    // 12. Customers List
    public function customers()
    {
        $customers = User::where('role', 'customer')
            ->withCount('orders')
            ->withSum('orders', 'total')
            ->latest()
            ->get();

        return response()->json($customers);
    }
}
