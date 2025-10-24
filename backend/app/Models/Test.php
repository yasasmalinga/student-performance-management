<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Test extends Model
{
    use HasFactory;

    protected $table = 'tests';
    protected $primaryKey = 'testId';
    
    const CREATED_AT = 'created_at';
    const UPDATED_AT = 'updated_at';

    protected $fillable = [
        'testType',
        'testMark',
        'testDate',
        'subjectRank',
        'subjectId',
        'teacherId',
    ];

    protected $casts = [
        'testType' => 'integer',
        'testMark' => 'integer',
        'testDate' => 'date',
        'subjectRank' => 'integer',
        'createdAt' => 'datetime',
        'updatedAt' => 'datetime',
    ];

    // Test type constants
    const TYPE_EXAM = 1;
    const TYPE_NON_ACADEMIC = 2;

    // Relationships
    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subjectId', 'subjectId');
    }

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacherId', 'userId');
    }

    public function exam()
    {
        return $this->hasOne(Exam::class, 'testId', 'testId');
    }

    public function nonAcademic()
    {
        return $this->hasOne(NonAcademic::class, 'testId', 'testId');
    }

    public function studentResults()
    {
        return $this->hasMany(StudentTestResult::class, 'testId', 'testId');
    }

    public function students()
    {
        return $this->belongsToMany(
            Student::class,
            'student_test_results',
            'testId',
            'studentId',
            'testId',
            'studentId'
        )->withPivot('marksObtained', 'grade', 'remarks');
    }
}

