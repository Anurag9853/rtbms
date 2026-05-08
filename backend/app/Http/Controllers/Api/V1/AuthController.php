<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Auth;

/**
 * AuthController — Sanctum token-based authentication
 * Routes:
 *   POST /api/v1/auth/register
 *   POST /api/v1/auth/login
 *   POST /api/v1/auth/logout
 *   GET  /api/v1/auth/me
 */
class AuthController extends Controller
{
    /**
     * POST /api/v1/auth/register
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();

        $user = User::create([
            'name'        => $data['name'],
            'email'       => $data['email'],
            'password'    => Hash::make($data['password']),
            'role'        => $data['role'],
            'phone'       => $data['phone'] ?? null,
            'city'        => $data['city'] ?? null,
            'blood_group' => $data['blood_group'] ?? null,
        ]);

        $token = $user->createToken('api-token');

        return response()->json([
            'user'  => $this->formatUser($user),
            'token' => $token->plainTextToken,
        ], 201);
    }

    /**
     * POST /api/v1/auth/login
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => 'The provided credentials are incorrect.',
            ]);
        }

        // Revoke old tokens (single-session)
        \App\Models\PersonalAccessToken::where('tokenable_id', (string)$user->id)->delete();
        $token = $user->createToken('api-token');

        return response()->json([
            'user'  => $this->formatUser($user),
            'token' => $token->plainTextToken,
        ]);
    }

    /**
     * POST /api/v1/auth/forgot-password
     * Sends a password reset email (logged to storage/logs in local env).
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        // Log-based mailer is configured — email is written to log, not sent
        // In production, configure a real mailer.
        try {
            $user = User::where('email', $request->email)->first();
            if ($user) {
                \Illuminate\Support\Facades\Log::info('[RTBMS] Password reset requested for: ' . $user->email);
                // TODO: send actual reset email via Mail::to($user)->send(new \App\Mail\ResetPassword($token))
            }
        } catch (\Exception) {}

        // Always return 200 to prevent email enumeration
        return response()->json(['message' => 'If an account with that email exists, a reset link has been sent.']);
    }

    /**
     * POST /api/v1/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        if ($user) {
            \App\Models\PersonalAccessToken::where('tokenable_id', (string)$user->id)->delete();
        }
        return response()->json(['message' => 'Logged out successfully.']);
    }

    /**
     * GET /api/v1/auth/me
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $this->formatUser($request->user())]);
    }

    /**
     * PATCH /api/v1/auth/profile
     * Update name, phone, city.
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'  => 'nullable|string|max:100',
            'phone' => 'nullable|string|max:20',
            'city'  => 'nullable|string|max:64',
        ]);

        $user = $request->user();
        $user->update(array_filter($data, fn ($v) => $v !== null));

        return response()->json(['user' => $this->formatUser($user->fresh())]);
    }

    /**
     * PATCH /api/v1/auth/password
     * Change user password.
     */
    public function changePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_password'      => 'required|string',
            'password'              => 'required|string|min:8',
            'password_confirmation' => 'required|same:password',
        ]);

        $user = $request->user();
        if (!Hash::check($data['current_password'], $user->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $user->update(['password' => Hash::make($data['password'])]);
        // Revoke all tokens and re-issue
        \App\Models\PersonalAccessToken::where('tokenable_id', (string)$user->id)->delete();
        $newToken = $user->createToken('api-token');

        return response()->json(['message' => 'Password changed.', 'token' => $newToken->plainTextToken]);
    }

    private function formatUser(User $user): array
    {
        return [
            'id'          => $user->id,
            'name'        => $user->name,
            'email'       => $user->email,
            'role'        => $user->role,
            'phone'       => $user->phone,
            'city'        => $user->city,
            'blood_group' => $user->blood_group,
            'is_available'=> $user->is_available,
        ];
    }
}
