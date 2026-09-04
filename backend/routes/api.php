<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\ContentController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Middleware\EnsureUserIsAdmin;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Authentication
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Catalog
Route::get('/categories', [CatalogController::class, 'categories']);
Route::get('/products', [CatalogController::class, 'products']);
Route::get('/products/{id}', [CatalogController::class, 'product']);

// Events & Reviews & Contact
Route::get('/events', [ContentController::class, 'events']);
Route::get('/reviews', [ContentController::class, 'reviews']);
Route::post('/contact', [ContentController::class, 'storeContact']);

// Birthday Menus & Public Available Slots
Route::get('/birthday-menus', [ReservationController::class, 'birthdayMenus']);
Route::get('/birthday-slots', [ReservationController::class, 'birthdaySlots']);
Route::get('/loyalty-info', [ContentController::class, 'loyaltyInfo']);

/*
|--------------------------------------------------------------------------
| Authenticated Customer Routes
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Orders (with loyalty point accrual + celebration check)
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/orders', [OrderController::class, 'store']);

    // Reservations (Table + Birthday)
    Route::get('/reservations', [ReservationController::class, 'userReservations']);
    Route::post('/reservations', [ReservationController::class, 'store']);

    // Reviews & Loyalty
    Route::post('/reviews', [ContentController::class, 'storeReview']);
    Route::get('/loyalty', [ContentController::class, 'loyaltyInfo']);

    /*
    |--------------------------------------------------------------------------
    | Admin Routes (role: admin)
    |--------------------------------------------------------------------------
    */
    Route::middleware(EnsureUserIsAdmin::class)->prefix('admin')->group(function () {
        Route::get('/stats', [AdminController::class, 'stats']);

        // Products CRUD
        Route::get('/products', [AdminController::class, 'products']);
        Route::post('/products', [AdminController::class, 'storeProduct']);
        Route::put('/products/{id}', [AdminController::class, 'updateProduct']);
        Route::delete('/products/{id}', [AdminController::class, 'deleteProduct']);

        // Categories CRUD
        Route::get('/categories', [AdminController::class, 'categories']);
        Route::post('/categories', [AdminController::class, 'storeCategory']);
        Route::put('/categories/{id}', [AdminController::class, 'updateCategory']);
        Route::delete('/categories/{id}', [AdminController::class, 'deleteCategory']);

        // Orders Management
        Route::get('/orders', [AdminController::class, 'orders']);
        Route::patch('/orders/{id}/status', [AdminController::class, 'updateOrderStatus']);

        // Reservations Management
        Route::get('/reservations', [AdminController::class, 'reservations']);
        Route::patch('/reservations/{id}/status', [AdminController::class, 'updateReservationStatus']);

        // Birthday Slots CRUD
        Route::get('/birthday-slots', [AdminController::class, 'birthdaySlots']);
        Route::post('/birthday-slots', [AdminController::class, 'storeBirthdaySlot']);
        Route::put('/birthday-slots/{id}', [AdminController::class, 'updateBirthdaySlot']);
        Route::delete('/birthday-slots/{id}', [AdminController::class, 'deleteBirthdaySlot']);

        // Birthday Menus CRUD
        Route::get('/birthday-menus', [AdminController::class, 'birthdayMenus']);
        Route::post('/birthday-menus', [AdminController::class, 'storeBirthdayMenu']);
        Route::put('/birthday-menus/{id}', [AdminController::class, 'updateBirthdayMenu']);
        Route::delete('/birthday-menus/{id}', [AdminController::class, 'deleteBirthdayMenu']);

        // Events CRUD
        Route::get('/events', [AdminController::class, 'events']);
        Route::post('/events', [AdminController::class, 'storeEvent']);
        Route::put('/events/{id}', [AdminController::class, 'updateEvent']);
        Route::delete('/events/{id}', [AdminController::class, 'deleteEvent']);

        // Reviews Moderation
        Route::get('/reviews', [AdminController::class, 'reviews']);
        Route::patch('/reviews/{id}/toggle', [AdminController::class, 'toggleReviewApproval']);
        Route::delete('/reviews/{id}', [AdminController::class, 'deleteReview']);

        // Contacts & Inquiries
        Route::get('/contacts', [AdminController::class, 'contacts']);
        Route::patch('/contacts/{id}/read', [AdminController::class, 'markContactRead']);

        // Loyalty Setting
        Route::get('/loyalty-settings', [AdminController::class, 'getLoyaltySettings']);
        Route::put('/loyalty-settings', [AdminController::class, 'updateLoyaltySettings']);

        // Customers List
        Route::get('/customers', [AdminController::class, 'customers']);
    });
});
