<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $table = 'notifications';
    protected $primaryKey = 'notificationId';
    public $timestamps = false;
    
    const CREATED_AT = 'createdAt';

    protected $fillable = [
        'subjectId',
        'studentId',
        'title',
        'message',
        'notificationType',
        'isRead',
    ];

    protected $casts = [
        'notificationType' => 'integer',
        'isRead' => 'boolean',
        'createdAt' => 'datetime',
    ];

    // Notification type constants
    const TYPE_ACADEMIC = 1;
    const TYPE_NON_ACADEMIC = 2;
    const TYPE_GENERAL = 3;

    // Relationships
    public function subject()
    {
        return $this->belongsTo(Subject::class, 'subjectId', 'subjectId');
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'studentId', 'studentId');
    }
}

