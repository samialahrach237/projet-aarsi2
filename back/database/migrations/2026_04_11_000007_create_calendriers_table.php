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
        Schema::create('calendriers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('prestataire_id');
            $table->date('date');
            $table->boolean('available')->default(true);
            $table->timestamps();

            $table->foreign('prestataire_id')->references('user_id')->on('prestataires')->cascadeOnDelete();
            $table->unique(['prestataire_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calendriers');
    }
};
