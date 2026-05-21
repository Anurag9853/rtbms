<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ChatController;
use App\Http\Controllers\Api\V1\InventoryController;
use App\Http\Controllers\Api\V1\BloodRequestController;
use App\Http\Controllers\Api\V1\DonorController;
use App\Http\Controllers\Api\V1\BloodBankController;
use App\Http\Controllers\Api\V1\CampaignController;
use App\Http\Controllers\Api\V1\AnalyticsController;

/*
|--------------------------------------------------------------------------
| API Routes — /api/v1/
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // ── Public routes ─────────────────────────────────────────────────────

    // Auth
    Route::prefix('auth')->group(function () {
        Route::post('register',        [AuthController::class, 'register']);
        Route::post('login',           [AuthController::class, 'login']);
        Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    });

    // Public: blood inventory search (no auth required for basic search)
    Route::get('inventory',        [InventoryController::class, 'index']);
    Route::get('inventory/search', [InventoryController::class, 'search']);

    // Public: emergency feed (public visibility)
    Route::get('requests/emergency', [BloodRequestController::class, 'activeEmergencies']);

    // AI chat suggestions (public — for landing page preview)
    Route::get('chat/suggestions', [ChatController::class, 'suggestions']);
    Route::post('chat',            [ChatController::class, 'stream']);

    // ── Protected routes (Sanctum auth required) ──────────────────────────

    Route::middleware('auth:sanctum')->group(function () {

        // Auth
        Route::post('auth/logout', [AuthController::class, 'logout']);
        Route::get('auth/me',      [AuthController::class, 'me']);
        Route::patch('auth/profile',  [AuthController::class, 'updateProfile']);
        Route::patch('auth/password', [AuthController::class, 'changePassword']);

        // AI Chat (streaming)
        Route::delete('chat/history',  [ChatController::class, 'clearHistory']);

        // Inventory management (blood bank admin)
        Route::patch('inventory/{inventory}', [InventoryController::class, 'update']);
        Route::get('inventory/low-stock',     [InventoryController::class, 'lowStock']);

        // Blood Requests
        Route::apiResource('requests', BloodRequestController::class);
        Route::post('requests/{request}/donate', [BloodRequestController::class, 'donate']);
        Route::patch('donations/{donation}/status', [BloodRequestController::class, 'updateDonationStatus']);

        // Donors
        Route::prefix('donors')->group(function () {
            Route::get('/',            [DonorController::class, 'index']);
            Route::get('{user}',       [DonorController::class, 'show']);
            Route::patch('{user}/availability', [DonorController::class, 'updateAvailability']);
            Route::get('{user}/history',        [DonorController::class, 'donationHistory']);
            Route::get('{user}/eligibility',    [DonorController::class, 'eligibility']);
        });

        // Blood Banks
        Route::apiResource('blood-banks', BloodBankController::class);

        // Campaigns
        Route::apiResource('campaigns', CampaignController::class);
        Route::post('campaigns/{campaign}/rsvp',   [CampaignController::class, 'rsvp']);
        Route::delete('campaigns/{campaign}/rsvp', [CampaignController::class, 'cancelRsvp']);

        // Analytics
        Route::get('analytics/summary',   [AnalyticsController::class, 'summary']);
        Route::get('analytics/inventory', [AnalyticsController::class, 'inventoryTrend']);
        Route::get('analytics/donors',    [AnalyticsController::class, 'donorGrowth']);
        Route::get('analytics/requests',  [AnalyticsController::class, 'requestStats']);

        // Admin: User management
        Route::get('users',              fn () => response()->json(\App\Models\User::select(['_id','name','email','role','city','blood_group','created_at'])->paginate(50)));
        Route::patch('users/{id}/role',  fn (\Illuminate\Http\Request $r, $id) => response()->json(tap(\App\Models\User::findOrFail($id))->update(['role' => $r->role])));
        Route::delete('users/{id}',      fn ($id) => response()->json(tap(\App\Models\User::findOrFail($id))->delete()));
    });
});
