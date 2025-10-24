<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Admin;
use App\Models\Teacher;
use App\Models\Student;
use App\Models\ParentModel;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create Admin
        $admin = User::create([
            'userName' => 'admin',
            'password' => 'admin123', // In production, use Hash::make('admin123')
            'userType' => User::TYPE_ADMIN,
            'userEmail' => 'admin@school.com',
            'userContact' => '1234567890',
        ]);

        Admin::create([
            'userId' => $admin->userId,
            'adminLevel' => Admin::LEVEL_SUPER_ADMIN,
        ]);

        // Create Teachers
        $teacher1 = User::create([
            'userName' => 'john_teacher',
            'password' => 'teacher123',
            'userType' => User::TYPE_TEACHER,
            'userEmail' => 'john.teacher@school.com',
            'userContact' => '1234567891',
        ]);

        Teacher::create([
            'userId' => $teacher1->userId,
            'employeeNumber' => 'T001',
            'department' => 'Mathematics',
            'specialization' => 'Advanced Mathematics',
        ]);

        $teacher2 = User::create([
            'userName' => 'sarah_teacher',
            'password' => 'teacher123',
            'userType' => User::TYPE_TEACHER,
            'userEmail' => 'sarah.teacher@school.com',
            'userContact' => '1234567892',
        ]);

        Teacher::create([
            'userId' => $teacher2->userId,
            'employeeNumber' => 'T002',
            'department' => 'Science',
            'specialization' => 'Physics',
        ]);

        $teacher3 = User::create([
            'userName' => 'mike_teacher',
            'password' => 'teacher123',
            'userType' => User::TYPE_TEACHER,
            'userEmail' => 'mike.teacher@school.com',
            'userContact' => '1234567893',
        ]);

        Teacher::create([
            'userId' => $teacher3->userId,
            'employeeNumber' => 'T003',
            'department' => 'English',
            'specialization' => 'English Literature',
        ]);

        // Create Parents
        $parent1 = User::create([
            'userName' => 'bob_parent',
            'password' => 'parent123',
            'userType' => User::TYPE_PARENT,
            'userEmail' => 'bob.parent@school.com',
            'userContact' => '1234567894',
        ]);

        $parentRecord1 = ParentModel::create([
            'userId' => $parent1->userId,
            'occupation' => 'Engineer',
        ]);

        $parent2 = User::create([
            'userName' => 'alice_parent',
            'password' => 'parent123',
            'userType' => User::TYPE_PARENT,
            'userEmail' => 'alice.parent@school.com',
            'userContact' => '1234567895',
        ]);

        $parentRecord2 = ParentModel::create([
            'userId' => $parent2->userId,
            'occupation' => 'Doctor',
        ]);

        // Create Students
        $student1 = User::create([
            'userName' => 'jane_student',
            'password' => 'student123',
            'userType' => User::TYPE_STUDENT,
            'userEmail' => 'jane.student@school.com',
            'userContact' => '1234567896',
        ]);

        $studentRecord1 = Student::create([
            'userId' => $student1->userId,
            'parentId' => $parent1->userId,
            'studentNumber' => 'S001',
            'dateOfBirth' => '2010-05-15',
            'enrollmentDate' => '2023-09-01',
        ]);

        $student2 = User::create([
            'userName' => 'tom_student',
            'password' => 'student123',
            'userType' => User::TYPE_STUDENT,
            'userEmail' => 'tom.student@school.com',
            'userContact' => '1234567897',
        ]);

        $studentRecord2 = Student::create([
            'userId' => $student2->userId,
            'parentId' => $parent2->userId,
            'studentNumber' => 'S002',
            'dateOfBirth' => '2010-08-22',
            'enrollmentDate' => '2023-09-01',
        ]);

        $student3 = User::create([
            'userName' => 'emma_student',
            'password' => 'student123',
            'userType' => User::TYPE_STUDENT,
            'userEmail' => 'emma.student@school.com',
            'userContact' => '1234567898',
        ]);

        $studentRecord3 = Student::create([
            'userId' => $student3->userId,
            'parentId' => $parent1->userId,
            'studentNumber' => 'S003',
            'dateOfBirth' => '2011-03-10',
            'enrollmentDate' => '2023-09-01',
        ]);

        $student4 = User::create([
            'userName' => 'oliver_student',
            'password' => 'student123',
            'userType' => User::TYPE_STUDENT,
            'userEmail' => 'oliver.student@school.com',
            'userContact' => '1234567899',
        ]);

        $studentRecord4 = Student::create([
            'userId' => $student4->userId,
            'parentId' => $parent2->userId,
            'studentNumber' => 'S004',
            'dateOfBirth' => '2010-11-30',
            'enrollmentDate' => '2023-09-01',
        ]);

        $student5 = User::create([
            'userName' => 'sophia_student',
            'password' => 'student123',
            'userType' => User::TYPE_STUDENT,
            'userEmail' => 'sophia.student@school.com',
            'userContact' => '1234567800',
        ]);

        $studentRecord5 = Student::create([
            'userId' => $student5->userId,
            'parentId' => $parent1->userId,
            'studentNumber' => 'S005',
            'dateOfBirth' => '2011-01-18',
            'enrollmentDate' => '2023-09-01',
        ]);

        // Update parent records with student IDs
        $parentRecord1->update(['studentId' => $studentRecord1->studentId]);
        $parentRecord2->update(['studentId' => $studentRecord2->studentId]);
    }
}

