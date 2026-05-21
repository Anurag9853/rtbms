<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BloodRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Events\EmergencyBroadcast;
use App\Events\RequestStatusChanged;

/**
 * BloodRequestController
 */
class BloodRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = BloodRequest::latest();

        if ($status = $request->query('status')) {
            $query->byStatus($status);
        }
        if ($group = $request->query('blood_group')) {
            $query->byBloodGroup($group);
        }
        if ($city = $request->query('city')) {
            $query->byCity($city);
        }
        if ($request->query('emergency')) {
            $query->emergency();
        }

        // Role-based scoping
        $user = $request->user();
        if ($user && $user->role === 'hospital') {
            $query->where('requester_id', (string)$user->id)
                  ->with('donations.donor');
        } elseif ($user && $user->role === 'donor') {
            $query->pending();
        } elseif ($user && in_array($user->role, ['admin', 'blood_bank'])) {
            $query->with('donations.donor');
        }

        $requests = $query->paginate(20);

        return response()->json($requests);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'patient_name'   => 'required|string|max:100',
            'blood_group'    => 'required|in:A+,A-,B+,B-,O+,O-,AB+,AB-',
            'units_needed'   => 'required|integer|min:1|max:20',
            'urgency'        => 'required|in:routine,high,critical',
            'hospital_name'  => 'required|string|max:150',
            'hospital_city'  => 'required|string|max:64',
            'notes'          => 'nullable|string|max:500',
        ]);

        $bloodRequest = BloodRequest::create([
            ...$data,
            'requester_id'   => (string)$request->user()->id,
            'requester_role' => $request->user()->role,
            'status'         => 'submitted',
        ]);

        // Broadcast emergency immediately
        if ($data['urgency'] === 'critical') {
            try { event(new EmergencyBroadcast($bloodRequest)); } catch (\Exception) {}
        }

        return response()->json(['data' => $bloodRequest], 201);
    }

    public function show($id): JsonResponse
    {
        $bloodRequest = BloodRequest::findOrFail($id);
        return response()->json(['data' => $bloodRequest]);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $bloodRequest = BloodRequest::findOrFail($id);
        
        // Manual authorization: only requester, blood bank admin, or system admin
        $user = $request->user();
        $canUpdate = $user->role === 'admin'
            || $user->role === 'blood_bank'
            || (string)$bloodRequest->requester_id === (string)$user->id;

        if (!$canUpdate) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $data = $request->validate([
            'status'           => 'nullable|in:submitted,reviewing,matched,in_transit,fulfilled,cancelled',
            'assigned_bank_id' => 'nullable|string',
            'notes'            => 'nullable|string|max:500',
        ]);

        $oldStatus = $bloodRequest->status;
        $newStatus = $data['status'] ?? $oldStatus;

        try {
            \Illuminate\Support\Facades\DB::connection('mongodb')->transaction(function () use ($bloodRequest, &$data, $oldStatus, $newStatus, $user) {
                $assignedBankId = $data['assigned_bank_id'] ?? $bloodRequest->assigned_bank_id;

                if (!$assignedBankId && $user->role === 'blood_bank') {
                    $bank = \App\Models\BloodBank::where('owner_id', $user->id)->first();
                    if ($bank) {
                        $assignedBankId = (string)$bank->id;
                        $data['assigned_bank_id'] = $assignedBankId;
                    }
                }

                if ($oldStatus !== 'fulfilled' && $newStatus === 'fulfilled' && $assignedBankId) {
                    $inventory = \App\Models\BloodInventory::where('blood_bank_id', $assignedBankId)
                        ->where('blood_group', $bloodRequest->blood_group)
                        ->first();

                    if ($inventory) {
                        if ($inventory->units_available >= $bloodRequest->units_needed) {
                            $inventory->decrement('units_available', $bloodRequest->units_needed);
                            $inventory->touch('last_updated_at');
                        } else {
                            throw new \Exception("Not enough blood units in inventory. Available: {$inventory->units_available}, Needed: {$bloodRequest->units_needed}");
                        }
                    } else {
                        throw new \Exception("Blood inventory not found for group {$bloodRequest->blood_group} at the assigned bank.");
                    }
                }

                $bloodRequest->update(array_filter($data, fn ($v) => $v !== null));
            });
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        }

        $bloodRequest->refresh();

        if (isset($data['status'])) {
            try { event(new RequestStatusChanged($bloodRequest)); } catch (\Exception $e) {}
        }

        return response()->json(['data' => $bloodRequest]);
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        $bloodRequest = BloodRequest::findOrFail($id);
        
        $user = $request->user();
        $canDelete = $user->role === 'admin'
            || (string)$bloodRequest->requester_id === (string)$user->id;

        if (!$canDelete) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $bloodRequest->cancel();
        return response()->json(['message' => 'Request cancelled.']);
    }

    public function donate(Request $request, $id): JsonResponse
    {
        $bloodRequest = BloodRequest::findOrFail($id);
        
        $user = $request->user();
        if ($user->role !== 'donor') {
            return response()->json(['message' => 'Only donors can donate.'], 403);
        }

        if (!$user->isEligibleToDonate()) {
            return response()->json([
                'message' => 'You are currently on a 45-day cooldown period and cannot pledge. You will be eligible in ' . $user->daysUntilEligible() . ' days.'
            ], 403);
        }

        $maxUnits = min(3, $bloodRequest->units_needed);

        $data = $request->validate([
            'units' => 'required|integer|min:1|max:' . max(1, $maxUnits),
        ]);

        if ($bloodRequest->units_needed < $data['units']) {
             return response()->json(['message' => 'Cannot donate more than needed.'], 400);
        }

        try {
            \Illuminate\Support\Facades\DB::connection('mongodb')->transaction(function () use ($bloodRequest, $data, $user) {
                $bloodRequest->units_needed -= $data['units'];
                
                if ($bloodRequest->units_needed <= 0) {
                    $bloodRequest->status = 'fulfilled';
                    $bloodRequest->units_needed = 0;
                }
                
                $bloodRequest->save();

                \App\Models\Donation::create([
                    'donor_id'    => (string)$user->id,
                    'request_id'  => (string)$bloodRequest->id,
                    'blood_group' => $bloodRequest->blood_group,
                    'units'       => $data['units'],
                    'status'      => 'scheduled',
                ]);
            });
        } catch (\Exception $e) {
             return response()->json(['message' => 'Failed to process donation: ' . $e->getMessage()], 400);
        }

        $bloodRequest->refresh();

        try { event(new RequestStatusChanged($bloodRequest)); } catch (\Exception $e) {}

        return response()->json([
            'message' => 'Donation successful',
            'data' => $bloodRequest
        ]);
    }
    public function updateDonationStatus(Request $request, $id): JsonResponse
    {
        $donation = \App\Models\Donation::with('request')->findOrFail($id);
        $user = $request->user();

        // Only the hospital that created the request or an admin can manage the pledge
        $canUpdate = $user->role === 'admin' || (string)$donation->request->requester_id === (string)$user->id;

        if (!$canUpdate) {
            return response()->json(['message' => 'Unauthorized. Only the requesting hospital can do this.'], 403);
        }

        $data = $request->validate([
            'status' => 'required|in:completed,cancelled',
        ]);

        if ($donation->status === $data['status']) {
            return response()->json(['message' => 'Status is already ' . $data['status']], 400);
        }

        $donation->status = $data['status'];

        if ($data['status'] === 'completed') {
            $donation->donated_at = now();
            // If the hospital also has an inventory record, we could add the units here.
            // \App\Models\BloodInventory::where('owner_id', $user->id)
            //     ->where('blood_group', $donation->blood_group)
            //     ->increment('units_available', $donation->units);
        } elseif ($data['status'] === 'cancelled') {
            // If cancelled, return the units back to the request
            $donation->request->units_needed += $donation->units;
            if ($donation->request->status === 'fulfilled') {
                $donation->request->status = 'reviewing'; // Re-open the request
            }
            $donation->request->save();
        }

        $donation->save();

        return response()->json(['message' => 'Donation marked as ' . $data['status'], 'data' => $donation]);
    }

    public function activeEmergencies(): JsonResponse
    {
        $emergencies = BloodRequest::emergency()
            ->pending()
            ->latest()
            ->limit(20)
            ->get();

        return response()->json(['data' => $emergencies]);
    }
}
