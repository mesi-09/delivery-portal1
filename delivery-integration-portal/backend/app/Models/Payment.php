<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'delivery_id',
        'amount',
        'payer',
        'method',
        'status',
        'transaction_reference',
    ];

    protected $casts = [
        'amount' => 'float',
    ];

    public function delivery()
    {
        return $this->belongsTo(Delivery::class);
    }
}
