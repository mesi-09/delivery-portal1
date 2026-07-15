<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tracking extends Model
{
    use HasFactory;

    protected $fillable = [
        'delivery_id',
        'status',
        'note',
        'latitude',
        'longitude',
    ];

    public function delivery()
    {
        return $this->belongsTo(Delivery::class);
    }
}
