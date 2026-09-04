<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        \Illuminate\Support\Facades\DB::statement('ALTER TABLE products MODIFY image LONGTEXT NULL');
        \Illuminate\Support\Facades\DB::statement('ALTER TABLE events MODIFY image LONGTEXT NULL');
        \Illuminate\Support\Facades\DB::statement('ALTER TABLE categories MODIFY image LONGTEXT NULL');
        \Illuminate\Support\Facades\DB::statement('ALTER TABLE birthday_menus MODIFY image LONGTEXT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    }
};
