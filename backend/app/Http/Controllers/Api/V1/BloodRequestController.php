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
            $query->where('requester_id', (string)$user->id);
        } elseif ($user && $user->role === 'donor') {
            $query->pending();
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

    public function show(BloodRequest $bloodRequest): JsonResponse
    {
        return response()->json(['data' => $bloodRequest]);
    }

    public function update(Request $request, BloodRequest $bloodRequest): JsonResponse
    {
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

        $bloodRequest->update(array_filter($data, fn ($v) => $v !== null));

        if (isset($data['status'])) {
            try { event(new RequestStatusChanged($bloodRequest->fresh())); } catch (\Exception) {}
        }

        return response()->json(['data' => $bloodRequest->fresh()]);
    }

    public function destroy(Request $request, BloodRequest $bloodRequest): JsonResponse
    {
        $user = $request->user();
        $canDelete = $user->role === 'admin'
            || (string)$bloodRequest->requester_id === (string)$user->id;

        if (!$canDelete) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $bloodRequest->cancel();
        return response()->json(['message' => 'Request cancelled.']);
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
