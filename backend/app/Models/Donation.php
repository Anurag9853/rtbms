<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * Donation — completed or in-progress donation record
 *
 * @property string $donor_id      (User._id)
 * @property string $blood_bank_id (BloodBank._id)
 * @property string $request_id    (BloodRequest._id, nullable)
 * @property string $blood_group
 * @property int    $units
 * @property string $status        (scheduled|completed|cancelled)
 * @property string $donated_at
 * @property string $notes
 * @property float  $hemoglobin_level
 */
class Donation extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'donations';
    protected $guarded    = [];

    protected $casts = [
        'units'            => 'integer',
        'donated_at'       => 'datetime',
        'hemoglobin_level' => 'float',
    ];

    public function donor()
    {
        return $this->belongsTo(User::class, 'donor_id');
    }

    public function bloodBank()
    {
        return $this->belongsTo(BloodBank::class, 'blood_bank_id');
    }

    public function request()
    {
        return $this->belongsTo(BloodRequest::class, 'request_id');
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopeByDonor($query, string $donorId)
    {
        return $query->where('donor_id', $donorId);
    }
}
