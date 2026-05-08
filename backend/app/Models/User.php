<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

/**
 * User model — stored in MongoDB 'users' collection
 *
 * Roles are stored directly in the 'role' field (no Spatie SQL tables needed).
 */
class User extends Model implements AuthenticatableContract
{
    use HasApiTokens, Authenticatable, Notifiable;

    protected $connection = 'mongodb';
    protected $collection = 'users';
    protected $guarded    = [];

    protected $hidden = ['password', 'remember_token'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
        'is_available'      => 'boolean',
        'location'          => 'array',
        'meta'              => 'array',
    ];

    protected $attributes = [
        'is_available' => true,
        'meta'         => [],
    ];

    // ── Sanctum token management (MongoDB-native) ─────────────────────────

    /**
     * Create a new personal access token for this user, stored in MongoDB.
     *
     * Returns a simple object with a 'plainTextToken' property.
     * (Avoids NewAccessToken which enforces a SQL Sanctum type constraint)
     */
    public function createToken(string $name, array $abilities = ['*'], ?\DateTimeInterface $expiresAt = null): object
    {
        $plainText = \Illuminate\Support\Str::random(40);
        $token = PersonalAccessToken::create([
            'name'          => $name,
            'token'         => hash('sha256', $plainText),
            'abilities'     => $abilities,
            'expires_at'    => $expiresAt,
            'tokenable_id'  => (string)$this->id,
            'tokenable_type'=> static::class,
        ]);

        $id = (string)$token->id;
        $plainTextToken = $id . '|' . $plainText;

        return (object) [
            'accessToken'    => $token,
            'plainTextToken' => $plainTextToken,
        ];
    }

    /**
     * Get all tokens for this user.
     */
    public function tokens()
    {
        return PersonalAccessToken::where('tokenable_id', (string)$this->id)
            ->where('tokenable_type', static::class);
    }

    /**
     * Get the current access token being used.
     */
    public function currentAccessToken(): ?PersonalAccessToken
    {
        return $this->accessToken ?? null;
    }

    /**
     * Set the current access token (called by Sanctum guard).
     */
    public function withAccessToken($accessToken): static
    {
        $this->accessToken = $accessToken;
        return $this;
    }

    // ── Role Helpers ─────────────────────────────────────────────────────

    public function hasRole(string|array $roles): bool
    {
        if (is_array($roles)) return in_array($this->role, $roles);
        return $this->role === $roles;
    }

    public function assignRole(string $role): void
    {
        $this->update(['role' => $role]);
    }

    // ── Relationships ──────────────────────────────────────────────────────

    public function donations()
    {
        return $this->hasMany(Donation::class);
    }

    public function requests()
    {
        return $this->hasMany(BloodRequest::class, 'requester_id');
    }

    // ── Scopes ──────────────────────────────────────────────────────────────

    public function scopeDonors($query)
    {
        return $query->where('role', 'donor');
    }

    public function scopeAvailable($query)
    {
        return $query->where('is_available', true);
    }

    public function scopeByBloodGroup($query, string $group)
    {
        return $query->where('blood_group', $group);
    }

    public function scopeByCity($query, string $city)
    {
        return $query->where('city', 'like', "%{$city}%");
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    public function isEligibleToDonate(): bool
    {
        $lastDonation = $this->donations()
            ->where('status', 'completed')
            ->latest('donated_at')
            ->first();

        if (!$lastDonation) return true;
        return now()->diffInDays($lastDonation->donated_at) >= 90;
    }

    public function daysUntilEligible(): int
    {
        $lastDonation = $this->donations()
            ->where('status', 'completed')
            ->latest('donated_at')
            ->first();

        if (!$lastDonation) return 0;
        $diff = now()->diffInDays($lastDonation->donated_at);
        return max(0, 90 - $diff);
    }
}
