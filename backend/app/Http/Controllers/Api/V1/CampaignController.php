<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\CampaignRegistration;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CampaignController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Campaign::upcoming()->paginate(10));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'          => 'required|string|max:150',
            'city'          => 'required|string|max:64',
            'address'       => 'required|string|max:255',
            'starts_at'     => 'required|date|after:now',
            'ends_at'       => 'required|date|after:starts_at',
            'max_slots'     => 'required|integer|min:1',
            'target_groups' => 'nullable|array',
        ]);

        $campaign = Campaign::create([
            ...$data,
            'organizer_id'     => $request->user()->id,
            'registered_slots' => 0,
            'is_active'        => true,
        ]);

        return response()->json(['data' => $campaign], 201);
    }

    public function show(Campaign $campaign): JsonResponse
    {
        return response()->json(['data' => $campaign]);
    }

    public function update(Request $request, Campaign $campaign): JsonResponse
    {
        $campaign->update($request->all());
        return response()->json(['data' => $campaign->fresh()]);
    }

    public function destroy(Campaign $campaign): JsonResponse
    {
        $campaign->update(['is_active' => false]);
        return response()->json(['message' => 'Campaign deactivated.']);
    }

    public function rsvp(Request $request, Campaign $campaign): JsonResponse
    {
        if ($campaign->isFull()) {
            return response()->json(['message' => 'Campaign is full.'], 422);
        }

        $campaign->increment('registered_slots');
        return response()->json([
            'message'          => 'RSVP successful!',
            'slots_remaining'  => $campaign->slotsRemaining(),
        ]);
    }

    public function cancelRsvp(Campaign $campaign): JsonResponse
    {
        $campaign->decrement('registered_slots');
        return response()->json(['message' => 'RSVP cancelled.']);
    }
}
