<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Grade extends Model
{
    use HasFactory;

    protected $table = 'grades';
    protected $primaryKey = 'gradeId';

    protected $fillable = [
        'gradeName',
        'gradeLevel',
        'description',
        'isActive',
    ];

    protected $casts = [
        'isActive' => 'boolean',
    ];

    // Relationship: A grade can have many students
    public function students()
    {
        return $this->hasMany(Student::class, 'gradeId', 'gradeId');
    }
}

