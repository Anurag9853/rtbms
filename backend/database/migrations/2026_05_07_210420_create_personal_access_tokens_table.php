<?php

use Illuminate\Database\Migrations\Migration;
use MongoDB\Laravel\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * For MongoDB, personal_access_tokens collection + indexes.
 * Uses MongoDB\Laravel\Schema\Blueprint (from mongodb/laravel-mongodb).
 */
return new class extends Migration
{
    protected $connection = 'mongodb';

    public function up(): void
    {
        Schema::connection('mongodb')->create('personal_access_tokens', function (Blueprint $collection) {
            $collection->unique('token');
            $collection->index(['tokenable_id', 'tokenable_type']);
            $collection->index('expires_at');
        });
    }

    public function down(): void
    {
        Schema::connection('mongodb')->dropIfExists('personal_access_tokens');
    }
};
