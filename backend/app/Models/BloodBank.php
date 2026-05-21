<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model;

/**
 * BloodBank — blood bank institutions
 *
 * @property string $name
 * @property string $license_no
 * @property string $city
 * @property string $state
 * @property string $address
 * @property array  $location  {type:'Point', coordinates:[lng, lat]}
 * @property array  $hours     {open:'08:00', close:'20:00', is_24hr: false}
 * @property bool   $is_active
 * @property string $contact_phone
 * @property string $contact_email
 * @property string $owner_id  (User._id with role=blood_bank)
 */
class BloodBank extends Model
{
    protected $connection = 'mongodb';
    protected $collection = 'blood_banks';
    protected $guarded    = [];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function inventory()
    {
        return $this->hasMany(BloodInventory::class);
    }

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function requests()
    {
        return $this->hasMany(BloodRequest::class, 'assigned_bank_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeByCity($query, string $city)
    {
        return $query->where('city', 'like', "%{$city}%");
    }
}
