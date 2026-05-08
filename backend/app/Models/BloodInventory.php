<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * BloodInventory — per-bank inventory per blood group
 *
 * @property string $blood_bank_id
 * @property string $blood_group   (A+|A-|B+|B-|O+|O-|AB+|AB-)
 * @property int    $units_available
 * @property int    $units_reserved
 * @property int    $minimum_threshold  (low-stock alert trigger)
 * @property string $last_updated_at
 * @property string $status  (sufficient|low|critical)
 */
class BloodInventory extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'blood_inventory';
    protected $guarded    = [];

    protected $casts = [
        'units_available'   => 'integer',
        'units_reserved'    => 'integer',
        'minimum_threshold' => 'integer',
        'last_updated_at'   => 'datetime',
    ];

    protected static $bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

    public function bloodBank()
    {
        return $this->belongsTo(BloodBank::class, 'blood_bank_id');
    }

    /**
     * Computed status based on available units vs threshold
     */
    public function getStatusAttribute(): string
    {
        if ($this->units_available <= 0) return 'out_of_stock';
        if ($this->units_available < $this->minimum_threshold) return 'critical';
        if ($this->units_available < $this->minimum_threshold * 2) return 'low';
        return 'sufficient';
    }

    public function scopeLowStock($query)
    {
        return $query->whereRaw(['units_available' => ['$lt' => '$minimum_threshold']]);
    }

    public function scopeByBloodGroup($query, string $group)
    {
        return $query->where('blood_group', $group);
    }

    public function reserve(int $units): bool
    {
        if ($this->units_available < $units) return false;
        $this->decrement('units_available', $units);
        $this->increment('units_reserved', $units);
        $this->touch('last_updated_at');
        return true;
    }

    public function release(int $units): void
    {
        $this->increment('units_available', $units);
        $this->decrement('units_reserved', $units);
        $this->touch('last_updated_at');
    }

    public static function getAllGroups(): array
    {
        return self::$bloodGroups;
    }
}
