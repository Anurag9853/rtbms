<?php

use Illuminate\Database\Migrations\Migration;

/**
 * Spatie Permission tables are NOT needed because we use a custom
 * 'role' field on the MongoDB User model. This migration is a no-op placeholder
 * that keeps the migration history intact without creating SQL tables.
 */
return new class extends Migration
{
    public function up(): void
    {
        // No-op: role management is handled via User.role field in MongoDB.
    }

    public function down(): void
    {
        // No-op.
    }
};
