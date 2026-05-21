<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BloodInventory;
use App\Models\BloodBank;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Events\InventoryUpdated;

/**
 * InventoryController
 * Routes:
 *   GET    /api/v1/inventory              → all inventory (grouped)
 *   GET    /api/v1/inventory/search       → search by group + city
 *   GET    /api/v1/inventory/low-stock    → low/critical items
 *   PATCH  /api/v1/inventory/{id}         → update units (blood bank admin)
 */
class InventoryController extends Controller
{
    /**
     * GET /api/v1/inventory
     * Returns aggregated inventory across all banks, grouped by blood group.
     */
    public function index(Request $request): JsonResponse
    {
        $query = BloodInventory::with('bloodBank:_id,name,city,location');

        if ($city = $request->query('city')) {
            $query->whereHas('bloodBank', fn ($q) => $q->byCity($city));
        }

        $inventory = $query->get();

        // Aggregate totals by blood group
        $summary = $inventory->groupBy('blood_group')->map(function ($items, $group) {
            $total = $items->sum('units_available');
            return [
                'blood_group'      => $group,
                'total_units'      => $total,
                'status'           => $total < 5 ? 'critical' : ($total < 15 ? 'low' : 'sufficient'),
                'sources_count'    => $items->count(),
                'banks'            => $items->map(fn ($i) => [
                    'inventory_id' => $i->_id,
                    'bank_id'   => $i->blood_bank_id,
                    'bank_name' => $i->bloodBank?->name,
                    'city'      => $i->bloodBank?->city,
                    'units'     => $i->units_available,
                    'status'    => $i->status,
                ]),
            ];
        })->values();

        return response()->json(['data' => $summary]);
    }

    /**
     * GET /api/v1/inventory/search?group=O-&city=Delhi
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'group' => 'nullable|in:A+,A-,B+,B-,O+,O-,AB+,AB-',
            'city'  => 'nullable|string|max:64',
        ]);

        $query = BloodInventory::with('bloodBank:_id,name,city,address,contact_phone,hours,location')
            ->where('units_available', '>', 0);

        if ($group = $request->query('group')) {
            $query->byBloodGroup($group);
        }

        if ($city = $request->query('city')) {
            $query->whereHas('bloodBank', fn ($q) => $q->byCity($city));
        }

        $results = $query->orderByDesc('units_available')->get();

        return response()->json([
            'data'  => $results,
            'count' => $results->count(),
        ]);
    }

    /**
     * GET /api/v1/inventory/low-stock
     */
    public function lowStock(): JsonResponse
    {
        $items = BloodInventory::with('bloodBank:_id,name,city')
            ->whereRaw(['$expr' => ['$lt' => ['$units_available', '$minimum_threshold']]])
            ->orderBy('units_available')
            ->get();

        return response()->json(['data' => $items]);
    }

    /**
     * PATCH /api/v1/inventory/{id}
     * Adjust units (blood bank staff only).
     */
    public function update(Request $request, BloodInventory $inventory): JsonResponse
    {
        // Role-based guard: only admin or blood_bank staff can adjust inventory
        abort_unless(
            in_array($request->user()->role, ['admin', 'blood_bank']),
            403,
            'Only blood bank administrators can update inventory.'
        );

        $data = $request->validate([
            'units_available'   => 'nullable|integer|min:0',
            'minimum_threshold' => 'nullable|integer|min:0',
            'operation'         => 'nullable|in:add,subtract,set',
            'units'             => 'nullable|integer|min:1',
        ]);

        if (isset($data['operation'], $data['units'])) {
            match ($data['operation']) {
                'add'      => $inventory->increment('units_available', $data['units']),
                'subtract' => $inventory->decrement('units_available', $data['units']),
                'set'      => $inventory->update(['units_available' => $data['units']]),
            };
        } elseif (isset($data['units_available'])) {
            $inventory->update(['units_available' => $data['units_available']]);
        }

        $inventory->touch('last_updated_at');
        $inventory->refresh();

        // Broadcast real-time update
        event(new InventoryUpdated($inventory));

        return response()->json(['data' => $inventory]);
    }
}
