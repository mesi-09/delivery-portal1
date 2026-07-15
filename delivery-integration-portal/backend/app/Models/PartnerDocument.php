<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PartnerDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'partner_id',
        'type',
        'original_name',
        'file_path',
        'mime_type',
        'size',
        'status',
        'admin_note',
    ];

    public function partner()
    {
        return $this->belongsTo(Partner::class);
    }
}
