<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use HasFactory;

    protected $table = 'students';
    protected $primaryKey = 'studentId';
    public $timestamps = false;

    protected $fillable = [
        'userId',
        'parentId',
        'gradeId',
        'studentNumber',
        'dateOfBirth',
        'enrollmentDate',
        'grade',
        'section',
    ];

    protected $casts = [
        'dateOfBirth' => 'date',
        'enrollmentDate' => 'date',
    ];

    // Relationships
    public function user()
    {
        return $this->belongsTo(User::class, 'userId', 'userId');
    }

    public function parent()
    {
        return $this->belongsTo(User::class, 'parentId', 'userId');
    }

    public function gradeLevel()
    {
        return $this->belongsTo(Grade::class, 'gradeId', 'gradeId');
    }

    public function testResults()
    {
        return $this->hasMany(StudentTestResult::class, 'studentId', 'studentId');
    }

    public function attendance()
    {
        return $this->hasMany(Attendance::class, 'studentId', 'studentId');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class, 'studentId', 'studentId');
    }

    public function tests()
    {
        return $this->belongsToMany(
            Test::class,
            'student_test_results',
            'studentId',
            'testId',
            'studentId',
            'testId'
        )->withPivot('marksObtained', 'grade', 'remarks');
    }
}

