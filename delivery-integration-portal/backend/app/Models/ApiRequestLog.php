<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ApiRequestLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'partner_id',
        'method',
        'path',
        'status_code',
        'response_time_ms',
    ];

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }
}
