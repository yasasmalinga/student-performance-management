<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    use HasFactory;

    protected $table = 'attendance';
    protected $primaryKey = 'attendanceId';
    public $timestamps = false;

    protected $fillable = [
        'studentId',
        'subjectId',
        'attendanceDate',
        'status',
        'remarks',
        'teacherId',
    ];

    protected $casts = [
        'attendanceDate' => 'date',
    ];

    // Status constants
    const STATUS_PRESENT = 'Present';
    const STATUS_ABSENT = 'Absent';
    const STATUS_LATE = 'Late';
    const STATUS_EXCUSED = 'Excused';

    // Relationships
    public function student()
    {
        return $this->belongsTo(Student::class, 'studentId', 'studentId');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subjectId', 'subjectId');
    }

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacherId', 'userId');
    }
}

