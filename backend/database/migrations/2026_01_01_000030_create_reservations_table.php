<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('birthday_slots', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->time('time');
            $table->integer('max_capacity')->default(20);
            $table->integer('current_bookings')->default(0);
            $table->boolean('is_available')->default(true);
            $table->timestamps();
        });

        Schema::create('birthday_menus', function (Blueprint $table) {
            $table->id();
            $table->string('name_fr');
            $table->string('name_en');
            $table->text('description_fr')->nullable();
            $table->text('description_en')->nullable();
            $table->decimal('price', 8, 2);
            $table->string('image')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['table', 'birthday'])->default('table');
            $table->date('date');
            $table->time('time');
            $table->integer('guests')->default(1);
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'confirmed', 'rejected', 'cancelled'])->default('pending');
            $table->foreignId('birthday_slot_id')->nullable()->constrained()->onDelete('set null');
            $table->foreignId('birthday_menu_id')->nullable()->constrained()->onDelete('set null');
            $table->string('birthday_person_name')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
        Schema::dropIfExists('birthday_menus');
        Schema::dropIfExists('birthday_slots');
    }
};
