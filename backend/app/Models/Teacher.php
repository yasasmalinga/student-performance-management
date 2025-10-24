<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
    use HasFactory;

    protected $table = 'teachers';
    protected $primaryKey = 'teacherId';
    public $timestamps = false;

    protected $fillable = [
        'userId',
        'employeeNumber',
        'department',
        'specialization',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class, 'userId', 'userId');
    }

    public function subjects()
    {
        return $this->belongsToMany(
            Subject::class,
            'teacher_subjects',
            'teacherId',
            'subjectId',
            'userId',
            'subjectId'
        )->withPivot('assignedDate');
    }

    public function tests()
    {
        return $this->hasMany(Test::class, 'teacherId', 'userId');
    }

    public function attendance()
    {
        return $this->hasMany(Attendance::class, 'teacherId', 'userId');
    }
}

