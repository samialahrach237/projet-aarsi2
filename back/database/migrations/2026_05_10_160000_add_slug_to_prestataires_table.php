<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('prestataires', function (Blueprint $table) {
            if (!Schema::hasColumn('prestataires', 'slug')) {
                $table->string('slug')->nullable()->after('nomEntreprise');
            }
        });

        $usedSlugs = [];

        DB::table('prestataires')
            ->select('user_id', 'nomEntreprise', 'slug')
            ->orderBy('user_id')
            ->get()
            ->each(function ($prestataire) use (&$usedSlugs): void {
                $baseSlug = Str::slug($prestataire->slug ?: $prestataire->nomEntreprise ?: 'prestataire');
                $slug = $baseSlug ?: 'prestataire';
                $suffix = 2;

                while (in_array($slug, $usedSlugs, true) || DB::table('prestataires')
                    ->where('slug', $slug)
                    ->where('user_id', '!=', $prestataire->user_id)
                    ->exists()) {
                    $slug = $baseSlug . '-' . $suffix;
                    $suffix++;
                }

                DB::table('prestataires')
                    ->where('user_id', $prestataire->user_id)
                    ->update(['slug' => $slug]);

                $usedSlugs[] = $slug;
            });

        Schema::table('prestataires', function (Blueprint $table) {
            $table->unique('slug');
        });
    }

    public function down(): void
    {
        Schema::table('prestataires', function (Blueprint $table) {
            if (Schema::hasColumn('prestataires', 'slug')) {
                $table->dropUnique(['slug']);
                $table->dropColumn('slug');
            }
        });
    }
};
