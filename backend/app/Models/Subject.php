<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    protected $table = 'subjects';
    protected $primaryKey = 'subjectId';
    public $timestamps = false;
    
    const CREATED_AT = 'createdAt';

    protected $fillable = [
        'subjectName',
        'subjectType',
        'description',
    ];

    protected $casts = [
        'subjectType' => 'integer',
        'createdAt' => 'datetime',
    ];

    // Subject type constants
    const TYPE_ACADEMIC = 1;
    const TYPE_NON_ACADEMIC = 2;

    // Relationships
    public function tests()
    {
        return $this->hasMany(Test::class, 'subjectId', 'subjectId');
    }

    public function teachers()
    {
        return $this->belongsToMany(
            Teacher::class,
            'teacher_subjects',
            'subjectId',
            'teacherId',
            'subjectId',
            'userId'
        )->withPivot('assignedDate');
    }

    public function attendance()
    {
        return $this->hasMany(Attendance::class, 'subjectId', 'subjectId');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'subjectId', 'subjectId');
    }
}

