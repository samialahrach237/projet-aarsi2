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
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        Schema::table('services', function (Blueprint $table) {
            $table->foreignId('category_id')
                ->nullable()
                ->after('prestataire_id')
                ->constrained('categories')
                ->nullOnDelete();
            $table->index('category_id');
        });

        $names = [
            'Lieux de reception',
            'Traiteur',
            'Negafa',
            'Photographie',
            'DJ & Orchestre',
            'Bijoux',
            'Tayfer',
        ];

        $timestamp = now();
        $rows = collect($names)->map(fn (string $name) => [
            'name' => $name,
            'slug' => Str::slug($name),
            'created_at' => $timestamp,
            'updated_at' => $timestamp,
        ])->all();

        DB::table('categories')->insert($rows);

        $categories = DB::table('categories')->pluck('id', 'name');

        foreach ($categories as $name => $id) {
            DB::table('services')
                ->where('category', $name)
                ->update(['category_id' => $id]);
        }
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropConstrainedForeignId('category_id');
        });

        Schema::dropIfExists('categories');
    }
};
