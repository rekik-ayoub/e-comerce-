<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('title_fr');
            $table->string('title_en');
            $table->text('description_fr')->nullable();
            $table->text('description_en')->nullable();
            $table->dateTime('event_date');
            $table->string('image')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('type', ['product', 'cafe'])->default('cafe');
            $table->tinyInteger('rating')->unsigned();
            $table->text('comment')->nullable();
            $table->boolean('approved')->default(false);
            $table->timestamps();
        });

        Schema::create('contacts', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('subject');
            $table->text('message');
            $table->boolean('read')->default(false);
            $table->timestamps();
        });

        Schema::create('loyalty_settings', function (Blueprint $table) {
            $table->id();
            $table->integer('points_per_order')->default(10);
            $table->integer('target_score')->default(100);
            $table->string('reward_description_fr')->default('Un café offert !');
            $table->string('reward_description_en')->default('A free coffee!');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('loyalty_settings');
        Schema::dropIfExists('contacts');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('events');
    }
};
