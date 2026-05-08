<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * BloodRequest — request submitted by hospital/donor
 *
 * @property string $requester_id     (User._id)
 * @property string $requester_role   (hospital|donor)
 * @property string $patient_name
 * @property string $blood_group
 * @property int    $units_needed
 * @property string $urgency          (routine|high|critical)
 * @property string $status           (submitted|reviewing|matched|in_transit|fulfilled|cancelled)
 * @property string $hospital_name
 * @property string $hospital_city
 * @property string $notes
 * @property string $assigned_bank_id (BloodBank._id)
 * @property string $fulfilled_at
 */
class BloodRequest extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'blood_requests';
    protected $guarded    = [];

    protected $casts = [
        'units_needed'  => 'integer',
        'fulfilled_at'  => 'datetime',
        'is_emergency'  => 'boolean',
    ];

    public function requester()
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function assignedBank()
    {
        return $this->belongsTo(BloodBank::class, 'assigned_bank_id');
    }

    public function donations()
    {
        return $this->hasMany(Donation::class, 'request_id');
    }

    public function scopeEmergency($query)
    {
        return $query->where('urgency', 'critical');
    }

    public function scopePending($query)
    {
        return $query->whereIn('status', ['submitted', 'reviewing', 'matched']);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByBloodGroup($query, string $group)
    {
        return $query->where('blood_group', $group);
    }

    public function scopeByCity($query, string $city)
    {
        return $query->where('hospital_city', 'like', "%{$city}%");
    }

    public function fulfill(): void
    {
        $this->update(['status' => 'fulfilled', 'fulfilled_at' => now()]);
    }

    public function cancel(): void
    {
        $this->update(['status' => 'cancelled']);
    }
}
