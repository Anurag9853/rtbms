<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * DonorController
 */
class DonorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::donors();

        if ($bg = $request->query('blood_group')) {
            $query->byBloodGroup($bg);
        }
        if ($city = $request->query('city')) {
            $query->byCity($city);
        }
        if ($request->query('available')) {
            $query->available();
        }

        $donors = $query->select(['_id', 'name', 'blood_group', 'city', 'is_available'])
            ->paginate(20);

        return response()->json($donors);
    }

    public function show(User $user): JsonResponse
    {
        $user->load(['donations' => fn ($q) => $q->completed()->latest('donated_at')->limit(10)]);

        return response()->json([
            'data' => [
                ...$user->only('_id', 'name', 'blood_group', 'city', 'phone', 'is_available'),
                'total_donations'   => $user->donations()->completed()->count(),
                'is_eligible'       => $user->isEligibleToDonate(),
                'days_until_eligible' => $user->daysUntilEligible(),
                'last_donation'     => $user->donations()->completed()->latest('donated_at')->first()?->donated_at,
                'recent_donations'  => $user->donations,
            ],
        ]);
    }

    public function updateAvailability(Request $request, User $user): JsonResponse
    {
        abort_unless(auth()->id() === $user->id || auth()->user()->hasRole('admin'), 403);

        $user->update(['is_available' => $request->boolean('is_available')]);

        return response()->json([
            'message'      => 'Availability updated.',
            'is_available' => $user->is_available,
        ]);
    }

    public function donationHistory(User $user): JsonResponse
    {
        $history = $user->donations()
            ->with('bloodBank:_id,name,city')
            ->latest('donated_at')
            ->paginate(20);

        return response()->json($history);
    }

    public function eligibility(User $user): JsonResponse
    {
        return response()->json([
            'is_eligible'          => $user->isEligibleToDonate(),
            'days_until_eligible'  => $user->daysUntilEligible(),
            'last_donation_date'   => $user->donations()->completed()->latest('donated_at')->first()?->donated_at,
            'total_donations'      => $user->donations()->completed()->count(),
        ]);
    }
}
