<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Tell Sanctum to use our custom MongoDB-backed token model for guard
        \Laravel\Sanctum\Sanctum::usePersonalAccessTokenModel(
            \App\Models\PersonalAccessToken::class
        );

        // Prevent accidental mass assignment across all MongoDB models
        \MongoDB\Laravel\Eloquent\Model::unguard();
    }
}
