<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ApiKey extends Model
{
    use HasFactory;

    protected $fillable = [
        'partner_id',
        'key',
        'name',
        'is_sandbox',
        'last_used_at',
        'is_active',
    ];

    protected $casts = [
        'is_sandbox' => 'boolean',
        'is_active' => 'boolean',
        'last_used_at' => 'datetime',
    ];

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }

    public static function generate(int $partnerId, bool $sandbox = false, string $name = null): self
    {
        $prefix = $sandbox ? 'tp_test_' : 'tp_live_';

        return self::create([
            'partner_id' => $partnerId,
            'key' => $prefix . Str::random(32),
            'name' => $name,
            'is_sandbox' => $sandbox,
            'is_active' => true,
        ]);
    }
}