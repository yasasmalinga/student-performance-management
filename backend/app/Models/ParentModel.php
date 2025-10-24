<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ParentModel extends Model
{
    use HasFactory;

    protected $table = 'parents';
    protected $primaryKey = 'parentId';
    public $timestamps = false;

    protected $fillable = [
        'userId',
        'occupation',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class, 'userId', 'userId');
    }

    // One parent can have multiple children
    public function students()
    {
        return $this->hasMany(Student::class, 'parentId', 'userId');
    }

    // Helper method to get all children
    public function children()
    {
        return $this->students();
    }
}

