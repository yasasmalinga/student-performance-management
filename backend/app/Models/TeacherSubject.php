<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TeacherSubject extends Model
{
    use HasFactory;

    protected $table = 'teacher_subjects';
    protected $primaryKey = 'assignmentId';
    public $timestamps = false;

    protected $fillable = [
        'teacherId',
        'subjectId',
        'assignedDate',
    ];

    protected $casts = [
        'assignedDate' => 'date',
    ];

    // Relationships
    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacherId', 'userId');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subjectId', 'subjectId');
    }
}

