<?php

namespace Database\Seeders;

use App\Models\User;
use Database\Seeders\DemoSeeder;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     * Run: php artisan db:seed
     */
    public function run(): void
    {
        $this->call(DemoSeeder::class);
    }
}
