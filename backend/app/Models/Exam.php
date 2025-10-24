<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    use HasFactory;

    protected $table = 'exams';
    protected $primaryKey = 'examId';
    public $timestamps = false;

    protected $fillable = [
        'testId',
        'testClass',
        'testDescription',
    ];

    protected $casts = [
        'testClass' => 'integer',
    ];

    // Relationships
    public function test()
    {
        return $this->belongsTo(Test::class, 'testId', 'testId');
    }
}

