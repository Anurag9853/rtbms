<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BloodInventory;
use App\Models\BloodRequest;
use App\Models\Donation;
use App\Models\User;
use Illuminate\Http\JsonResponse;

/**
 * AnalyticsController — aggregated platform statistics
 */
class AnalyticsController extends Controller
{
    /**
     * GET /api/v1/analytics/summary
     * Top-level platform KPIs.
     */
    public function summary(): JsonResponse
    {
        $activeDonors     = User::donors()->available()->count();
        $totalDonors      = User::donors()->count();
        $unitsAvailable   = (int) BloodInventory::sum('units_available');
        $activeEmergencies= BloodRequest::emergency()->pending()->count();
        $requestsFulfilled= BloodRequest::where('status', 'fulfilled')->count();

        $inventory = BloodInventory::all()->groupBy('blood_group')->map(function ($items, $group) {
            $total = $items->sum('units_available');
            return [
                'blood_group' => $group,
                'total_units' => $total,
                'status'      => $total < 5 ? 'critical' : ($total < 15 ? 'low' : 'sufficient'),
            ];
        })->values();

        return response()->json([
            'data' => [
                'active_donors'      => $activeDonors,
                'total_donors'       => $totalDonors,
                'units_available'    => $unitsAvailable,
                'active_emergencies' => $activeEmergencies,
                'requests_fulfilled' => $requestsFulfilled,
                'inventory'          => $inventory,
            ],
        ]);
    }

    /**
     * GET /api/v1/analytics/donors?period=30
     * Donor registration growth over time.
     */
    public function donorGrowth(): JsonResponse
    {
        // MongoDB aggregation for monthly donor counts
        $pipeline = [
            ['$match' => ['role' => 'donor']],
            ['$group' => [
                '_id' => [
                    'year'  => ['$year'  => '$created_at'],
                    'month' => ['$month' => '$created_at'],
                ],
                'count' => ['$sum' => 1],
            ]],
            ['$sort' => ['_id.year' => 1, '_id.month' => 1]],
            ['$limit' => 12],
        ];

        $result = \DB::connection('mongodb')->collection('users')->raw(function ($col) use ($pipeline) {
            return $col->aggregate($pipeline)->toArray();
        });

        return response()->json(['data' => $result]);
    }

    /**
     * GET /api/v1/analytics/requests
     * Request stats by blood group and urgency.
     */
    public function requestStats(): JsonResponse
    {
        $byGroup = BloodRequest::all()->groupBy('blood_group')->map(fn ($g) => $g->count());
        $byUrgency = BloodRequest::all()->groupBy('urgency')->map(fn ($g) => $g->count());
        $byStatus  = BloodRequest::all()->groupBy('status')->map(fn ($g) => $g->count());

        return response()->json([
            'data' => [
                'by_blood_group' => $byGroup,
                'by_urgency'     => $byUrgency,
                'by_status'      => $byStatus,
                'total'          => BloodRequest::count(),
                'fulfillment_rate' => BloodRequest::count() > 0
                    ? round(BloodRequest::where('status', 'fulfilled')->count() / BloodRequest::count() * 100, 1)
                    : 0,
            ],
        ]);
    }

    /**
     * GET /api/v1/analytics/inventory
     * Inventory levels over time for trend charts.
     */
    public function inventoryTrend(): JsonResponse
    {
        $summary = BloodInventory::all()->groupBy('blood_group')->map(function ($items, $group) {
            return [
                'group'  => $group,
                'total'  => $items->sum('units_available'),
                'status' => $items->first()?->status,
                'banks'  => $items->count(),
            ];
        })->values();

        return response()->json(['data' => $summary]);
    }
}
