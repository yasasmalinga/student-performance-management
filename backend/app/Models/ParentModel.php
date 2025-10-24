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
        'studentId',
        'occupation',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class, 'userId', 'userId');
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'studentId', 'studentId');
    }
}

