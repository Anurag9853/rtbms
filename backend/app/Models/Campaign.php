<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * Campaign — blood drive events
 */
class Campaign extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'campaigns';
    protected $guarded    = [];

    protected $casts = [
        'starts_at'        => 'datetime',
        'ends_at'          => 'datetime',
        'max_slots'        => 'integer',
        'registered_slots' => 'integer',
        'target_groups'    => 'array',
        'location'         => 'array',
        'is_active'        => 'boolean',
    ];

    public function organizer()
    {
        return $this->belongsTo(User::class, 'organizer_id');
    }

    public function registrations()
    {
        return $this->hasMany(CampaignRegistration::class);
    }

    public function scopeUpcoming($query)
    {
        return $query->where('starts_at', '>', now())->where('is_active', true);
    }

    public function scopeByCity($query, string $city)
    {
        return $query->where('city', 'like', "%{$city}%");
    }

    public function slotsRemaining(): int
    {
        return max(0, $this->max_slots - $this->registered_slots);
    }

    public function isFull(): bool
    {
        return $this->registered_slots >= $this->max_slots;
    }
}
