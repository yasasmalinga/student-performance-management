<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Grade;

class GradeSeeder extends Seeder
{
    public function run(): void
    {
        $grades = [
            ['gradeName' => 'Grade 6', 'gradeLevel' => '6', 'description' => 'Sixth grade students', 'isActive' => true],
            ['gradeName' => 'Grade 7', 'gradeLevel' => '7', 'description' => 'Seventh grade students', 'isActive' => true],
            ['gradeName' => 'Grade 8', 'gradeLevel' => '8', 'description' => 'Eighth grade students', 'isActive' => true],
            ['gradeName' => 'Grade 9', 'gradeLevel' => '9', 'description' => 'Ninth grade students', 'isActive' => true],
            ['gradeName' => 'Grade 10', 'gradeLevel' => '10', 'description' => 'Tenth grade students', 'isActive' => true],
            ['gradeName' => 'Grade 11', 'gradeLevel' => '11', 'description' => 'Eleventh grade students', 'isActive' => true],
            ['gradeName' => 'Grade 12', 'gradeLevel' => '12', 'description' => 'Twelfth grade students', 'isActive' => true],
        ];

        foreach ($grades as $grade) {
            Grade::create($grade);
        }
    }
}

