<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Admin extends Model
{
    use HasFactory;

    protected $table = 'admins';
    protected $primaryKey = 'adminId';
    public $timestamps = false;

    protected $fillable = [
        'userId',
        'adminLevel',
    ];

    protected $casts = [
        'adminLevel' => 'integer',
    ];

    // Admin level constants
    const LEVEL_SUPER_ADMIN = 1;
    const LEVEL_ADMIN = 2;

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class, 'userId', 'userId');
    }
}

