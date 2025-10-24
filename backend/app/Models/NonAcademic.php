<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NonAcademic extends Model
{
    use HasFactory;

    protected $table = 'non_academic';
    protected $primaryKey = 'nonAcademicId';
    public $timestamps = false;

    protected $fillable = [
        'testId',
        'eventType',
        'eventDate',
        'rank',
        'eventDescription',
        'eventLevel',
    ];

    protected $casts = [
        'eventType' => 'integer',
        'eventDate' => 'date',
        'rank' => 'integer',
    ];

    // Relationships
    public function test()
    {
        return $this->belongsTo(Test::class, 'testId', 'testId');
    }
}

