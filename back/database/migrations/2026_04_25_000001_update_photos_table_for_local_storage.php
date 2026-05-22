<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('photos', 'url') && !Schema::hasColumn('photos', 'path')) {
            DB::statement('ALTER TABLE photos CHANGE url path VARCHAR(255) NOT NULL');
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('photos', 'path') && !Schema::hasColumn('photos', 'url')) {
            DB::statement('ALTER TABLE photos CHANGE path url VARCHAR(255) NOT NULL');
        }
    }
};
