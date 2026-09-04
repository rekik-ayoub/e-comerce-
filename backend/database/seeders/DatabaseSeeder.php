<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use App\Models\BirthdaySlot;
use App\Models\BirthdayMenu;
use App\Models\Event;
use App\Models\Review;
use App\Models\LoyaltySetting;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Admin User
        $admin = User::updateOrCreate(
            ['email' => 'admin@lebayou.com'],
            [
                'name' => 'Admin Le Bayou',
                'password' => Hash::make('admin123456'),
                'role' => 'admin',
                'phone' => '+33 1 23 45 67 89',
                'points' => 0,
            ]
        );

        // 2. Demo Customer
        $customer = User::updateOrCreate(
            ['email' => 'ayoub@example.com'],
            [
                'name' => 'Ayoub Rekik',
                'password' => Hash::make('password123'),
                'role' => 'customer',
                'phone' => '+33 6 12 34 56 78',
                'points' => 30, // 30 points accumulated
            ]
        );

        // 3. Loyalty Setting
        LoyaltySetting::updateOrCreate(
            ['id' => 1],
            [
                'points_per_order' => 10,
                'target_score' => 50, // 5 orders = 1 free coffee
                'reward_description_fr' => 'Félicitations ! Vous avez droit à un café ou cappuccino Signature offert !',
                'reward_description_en' => 'Congratulations! You unlocked a free Signature Coffee or Cappuccino!',
            ]
        );

        // 4. Categories
        $catEspresso = Category::create([
            'name_fr' => 'Cafés & Espressos',
            'name_en' => 'Coffees & Espressos',
            'image' => 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop',
            'active' => true,
        ]);

        $catCold = Category::create([
            'name_fr' => 'Boissons Fraîches',
            'name_en' => 'Cold Brews & Iced Drinks',
            'image' => 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop',
            'active' => true,
        ]);

        $catPastry = Category::create([
            'name_fr' => 'Pâtisseries & Gourmandises',
            'name_en' => 'Pastries & Sweets',
            'image' => 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop',
            'active' => true,
        ]);

        $catMerch = Category::create([
            'name_fr' => 'Grains & Merch',
            'name_en' => 'Coffee Beans & Merch',
            'image' => 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=600&auto=format&fit=crop',
            'active' => true,
        ]);

        // 5. Products
        Product::create([
            'category_id' => $catEspresso->id,
            'name_fr' => 'Bayou Signature Blend',
            'name_en' => 'Bayou Signature Blend',
            'description_fr' => 'Notes de chocolat noir, caramel au beurre salé et noisettes grillées.',
            'description_en' => 'Tasting notes of dark chocolate, salted caramel, and roasted hazelnuts.',
            'price' => 4.50,
            'image' => 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop',
            'available' => true,
            'featured' => true,
        ]);

        Product::create([
            'category_id' => $catEspresso->id,
            'name_fr' => 'Cappuccino Velouté',
            'name_en' => 'Velvet Cappuccino',
            'description_fr' => 'Double shot d\'espresso avec mousse de lait onctueuse et saupoudré de cacao pur.',
            'description_en' => 'Double espresso shot with silky micro-foam milk and dusted with pure cocoa.',
            'price' => 4.80,
            'image' => 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=600&auto=format&fit=crop',
            'available' => true,
            'featured' => true,
        ]);

        Product::create([
            'category_id' => $catEspresso->id,
            'name_fr' => 'Latte Caramel & Épices',
            'name_en' => 'Spiced Caramel Latte',
            'description_fr' => 'Infusion douce de vanille de Madagascar, cannelle et coulis de caramel maison.',
            'description_en' => 'Gentle infusion of Madagascar vanilla, cinnamon and homemade caramel drizzle.',
            'price' => 5.20,
            'image' => 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=600&auto=format&fit=crop',
            'available' => true,
            'featured' => true,
        ]);

        Product::create([
            'category_id' => $catCold->id,
            'name_fr' => 'Cold Brew Nitro Bayou',
            'name_en' => 'Bayou Nitro Cold Brew',
            'description_fr' => 'Café infusé à froid pendant 24h avec cascade crémeuse d\'azote pur.',
            'description_en' => '24-hour slow steeped cold brew infused with nitrogen for a velvety cascade.',
            'price' => 5.50,
            'image' => 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop',
            'available' => true,
            'featured' => true,
        ]);

        Product::create([
            'category_id' => $catCold->id,
            'name_fr' => 'Iced Vanilla Matcha Latte',
            'name_en' => 'Iced Vanilla Matcha Latte',
            'description_fr' => 'Matcha cérémonial japonais, lait d\'avoine bio et vanille parfumée.',
            'description_en' => 'Ceremonial grade Japanese matcha, organic oat milk, and scented vanilla.',
            'price' => 5.80,
            'image' => 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600&auto=format&fit=crop',
            'available' => true,
            'featured' => false,
        ]);

        Product::create([
            'category_id' => $catPastry->id,
            'name_fr' => 'Croissant Artisanal Beurre AOP',
            'name_en' => 'Artisanal AOP Butter Croissant',
            'description_fr' => 'Feuilletage croustillant et fondant au beurre des Charentes.',
            'description_en' => 'Flaky, buttery perfection baked fresh every morning.',
            'price' => 2.80,
            'image' => 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop',
            'available' => true,
            'featured' => false,
        ]);

        Product::create([
            'category_id' => $catPastry->id,
            'name_fr' => 'Cheesecake Caramel Spéculoos',
            'name_en' => 'Speculoos Caramel Cheesecake',
            'description_fr' => 'Base croustillante aux biscuits spéculoos et coulis fondant.',
            'description_en' => 'Rich creamy cheesecake on spiced biscuit base with golden caramel drizzle.',
            'price' => 5.90,
            'image' => 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop',
            'available' => true,
            'featured' => true,
        ]);

        Product::create([
            'category_id' => $catMerch->id,
            'name_fr' => 'Grains Éthiopie Yirgacheffe 250g',
            'name_en' => 'Ethiopian Yirgacheffe Beans 250g',
            'description_fr' => '100% Arabica, notes florales de jasmin et bergamote, torréfaction artisanale.',
            'description_en' => '100% Arabica, floral notes of jasmine and bergamot, light artisan roast.',
            'price' => 14.50,
            'image' => 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?w=600&auto=format&fit=crop',
            'available' => true,
            'featured' => false,
        ]);

        // 6. Birthday Menus
        BirthdayMenu::create([
            'name_fr' => 'Formule Lounge Douceur (6-10 pers.)',
            'name_en' => 'Lounge Sweet Package (6-10 guests)',
            'description_fr' => 'Gâteau artisanal au choix, boissons chaudes et fraîches à volonté, décoration florale élégante de table.',
            'description_en' => 'Artisanal cake of choice, unlimited hot & cold beverages, elegant floral table decoration.',
            'price' => 85.00,
            'image' => 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format&fit=crop',
            'active' => true,
        ]);

        BirthdayMenu::create([
            'name_fr' => 'Formule Bayou Prestige (10-20 pers.)',
            'name_en' => 'Bayou Prestige VIP Package (10-20 guests)',
            'description_fr' => 'Espace salon privatisé 3h, grand gâteau signature, buffet mini-pâtisseries, bar à cafés gourmands avec barista dédié.',
            'description_en' => 'Privatized lounge area for 3h, grand signature cake, mini-pastries buffet, dedicated specialty coffee barista bar.',
            'price' => 180.00,
            'image' => 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&auto=format&fit=crop',
            'active' => true,
        ]);

        // 7. Birthday Available Slots (Upcoming dates)
        $today = now();
        for ($i = 1; $i <= 14; $i++) {
            $date = $today->copy()->addDays($i)->format('Y-m-d');
            BirthdaySlot::create([
                'date' => $date,
                'time' => '14:30:00',
                'max_capacity' => 1,
                'current_bookings' => 0,
                'is_available' => true,
            ]);
            BirthdaySlot::create([
                'date' => $date,
                'time' => '17:00:00',
                'max_capacity' => 1,
                'current_bookings' => 0,
                'is_available' => true,
            ]);
            BirthdaySlot::create([
                'date' => $date,
                'time' => '19:30:00',
                'max_capacity' => 1,
                'current_bookings' => 0,
                'is_available' => true,
            ]);
        }

        // 8. Events
        Event::create([
            'title_fr' => 'Soirée Acoustique & Jazz Lounge',
            'title_en' => 'Acoustic & Jazz Lounge Night',
            'description_fr' => 'Venez savourer nos cafés rares accompagnés d\'un duo guitare & contrebasse jazz en direct.',
            'description_en' => 'Enjoy our rare origin coffees while listening to a live jazz guitar & double bass duet.',
            'event_date' => now()->addDays(5)->setHour(20)->setMinute(0),
            'image' => 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop',
            'active' => true,
        ]);

        Event::create([
            'title_fr' => 'Atelier Latte Art & Dégustation Cupping',
            'title_en' => 'Latte Art & Cupping Masterclass',
            'description_fr' => 'Apprenez à mousser le lait comme un pro et découvrez les secrets de torréfaction de nos baristas.',
            'description_en' => 'Learn to texture milk like a champion barista and explore the roasting secrets of our single origins.',
            'event_date' => now()->addDays(12)->setHour(10)->setMinute(30),
            'image' => 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&auto=format&fit=crop',
            'active' => true,
        ]);

        // 9. Reviews
        Review::create([
            'user_id' => $customer->id,
            'type' => 'cafe',
            'rating' => 5,
            'comment' => 'Le Bayou est mon refuge préféré ! L\'ambiance lumineuse, l\'arôme de café fraîchement moulu et l\'accueil chaleureux sont incomparables.',
            'approved' => true,
        ]);

        Review::create([
            'user_id' => $customer->id,
            'product_id' => 1,
            'type' => 'product',
            'rating' => 5,
            'comment' => 'Le Bayou Signature Blend est exceptionnel. Rond, avec une belle note chocolatée sans aucune amertume.',
            'approved' => true,
        ]);
    }
}
