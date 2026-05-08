<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\BloodBank;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BloodBankController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(BloodBank::active()->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'          => 'required|string|max:150',
            'license_no'    => 'required|string|max:50',
            'city'          => 'required|string|max:64',
            'state'         => 'required|string|max:64',
            'address'       => 'required|string|max:255',
            'contact_phone' => 'required|string|max:20',
            'contact_email' => 'required|email',
        ]);

        $bank = BloodBank::create([...$data, 'owner_id' => $request->user()->id, 'is_active' => true]);
        return response()->json(['data' => $bank], 201);
    }

    public function show(BloodBank $bloodBank): JsonResponse
    {
        return response()->json(['data' => $bloodBank->load('inventory')]);
    }

    public function update(Request $request, BloodBank $bloodBank): JsonResponse
    {
        $bloodBank->update($request->validated());
        return response()->json(['data' => $bloodBank->fresh()]);
    }

    public function destroy(BloodBank $bloodBank): JsonResponse
    {
        $bloodBank->update(['is_active' => false]);
        return response()->json(['message' => 'Blood bank deactivated.']);
    }
}
