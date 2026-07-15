<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Partner extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'business_name',
        'business_email',
        'business_phone',
        'address',
        'webhook_url',
        'status',
        'rate_limit_per_minute',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function apiKeys()
    {
        return $this->hasMany(ApiKey::class);
    }

    public function deliveries()
    {
        return $this->hasMany(Delivery::class);
    }
}
