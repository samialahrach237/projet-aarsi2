<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            if (!Schema::hasColumn('reservations', 'guests')) {
                $table->unsignedInteger('guests')->default(1)->after('reservation_date');
            }

            if (!Schema::hasColumn('reservations', 'reservation_time')) {
                $table->time('reservation_time')->nullable()->after('guests');
            }

            if (!Schema::hasColumn('reservations', 'phone')) {
                $table->string('phone')->nullable()->after('reservation_time');
            }

            if (!Schema::hasColumn('reservations', 'city')) {
                $table->string('city')->nullable()->after('phone');
            }
        });
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropColumn(['guests', 'reservation_time', 'phone', 'city']);
        });
    }
};
