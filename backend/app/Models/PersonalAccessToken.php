<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * MongoDB-native PersonalAccessToken (fully independent of Sanctum SQL model).
 *
 * This model handles token CRUD entirely in MongoDB. The auth:sanctum guard
 * is configured to call findToken() on this class via Sanctum::usePersonalAccessTokenModel().
 *
 * IMPORTANT: This does NOT extend Laravel\Sanctum\PersonalAccessToken
 * to avoid the SQL Eloquent dependency. Instead, User::createToken() creates
 * tokens directly in this model and returns a stdClass/array with the plainTextToken.
 */
class PersonalAccessToken extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'personal_access_tokens';
    protected $guarded    = [];
    protected $hidden     = ['token'];

    protected $casts = [
        'abilities'    => 'array',
        'last_used_at' => 'datetime',
        'expires_at'   => 'datetime',
    ];

    /**
     * Find a token record by its plain text value.
     * Called by Sanctum's Guard on every authenticated request.
     */
    public static function findToken($token): ?static
    {
        if (str_contains($token, '|')) {
            [$id, $plain] = explode('|', $token, 2);

            try {
                $instance = static::find($id);
            } catch (\Exception) {
                $instance = null;
            }

            if ($instance && hash_equals($instance->token, hash('sha256', $plain))) {
                return $instance;
            }

            return null;
        }

        return static::where('token', hash('sha256', $token))->first();
    }

    /**
     * Polymorphic relation back to the owning model.
     */
    public function tokenable()
    {
        return $this->belongsTo(User::class, 'tokenable_id');
    }

    /**
     * Check if this token can perform the given ability.
     */
    public function can($ability, $arguments = []): bool
    {
        $abilities = $this->abilities ?? ['*'];
        return in_array('*', $abilities) || in_array($ability, $abilities);
    }

    public function cant($ability): bool
    {
        return !$this->can($ability);
    }
}
