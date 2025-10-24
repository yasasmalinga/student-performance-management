<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentTestResult extends Model
{
    use HasFactory;

    protected $table = 'student_test_results';
    protected $primaryKey = 'resultId';
    public $timestamps = false;

    protected $fillable = [
        'studentId',
        'testId',
        'marksObtained',
        'grade',
        'remarks',
    ];

    protected $casts = [
        'marksObtained' => 'integer',
    ];

    // Relationships
    public function student()
    {
        return $this->belongsTo(Student::class, 'studentId', 'studentId');
    }

    public function test()
    {
        return $this->belongsTo(Test::class, 'testId', 'testId');
    }
}

