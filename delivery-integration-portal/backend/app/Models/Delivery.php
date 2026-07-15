<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Delivery extends Model
{
    use HasFactory;

    protected $fillable = [
        'partner_id',
        'driver_id',
        'pickup_contact_name',
        'pickup_contact_number',
        'pickup_address',
        'pickup_latitude',
        'pickup_longitude',
        'dropoff_contact_name',
        'dropoff_contact_number',
        'dropoff_address',
        'dropoff_latitude',
        'dropoff_longitude',
        'parcel_category_id',
        'charge_payer',
        'delivery_charge',
        'tracking_number',
        'third_party_reference_id',
        'status',
        'is_sandbox',
    ];

    protected $casts = [
        'is_sandbox' => 'boolean',
        'pickup_latitude' => 'float',
        'pickup_longitude' => 'float',
        'dropoff_latitude' => 'float',
        'dropoff_longitude' => 'float',
        'delivery_charge' => 'float',
    ];

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }

    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function trackingEvents()
    {
        return $this->hasMany(Tracking::class);
    }
}