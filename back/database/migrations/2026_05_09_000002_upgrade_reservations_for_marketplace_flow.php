<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->unsignedBigInteger('prestataire_id')->nullable()->after('client_id');
            $table->date('reservation_date')->nullable()->after('service_id');
            $table->text('message')->nullable()->after('end_time');

            $table->foreign('prestataire_id')
                ->references('user_id')
                ->on('prestataires')
                ->nullOnDelete();

            $table->index(['prestataire_id', 'reservation_date']);
        });

        DB::table('reservations')
            ->join('services', 'services.id', '=', 'reservations.service_id')
            ->update([
                'reservations.prestataire_id' => DB::raw('services.prestataire_id'),
                'reservations.reservation_date' => DB::raw('reservations.date'),
            ]);
    }

    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropForeign(['prestataire_id']);
            $table->dropIndex(['prestataire_id', 'reservation_date']);
            $table->dropColumn(['prestataire_id', 'reservation_date', 'message']);
        });
    }
};
