<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance', function (Blueprint $table) {
            $table->id('attendanceId');
            $table->unsignedBigInteger('studentId');
            $table->unsignedBigInteger('subjectId');
            $table->date('attendanceDate');
            $table->enum('status', ['Present', 'Absent', 'Late', 'Excused'])->default('Present');
            $table->text('remarks')->nullable();
            $table->unsignedBigInteger('teacherId')->nullable();
            
            $table->foreign('studentId')->references('studentId')->on('students')->onDelete('cascade');
            $table->foreign('subjectId')->references('subjectId')->on('subjects')->onDelete('cascade');
            $table->foreign('teacherId')->references('userId')->on('users')->onDelete('set null');
            
            $table->unique(['studentId', 'subjectId', 'attendanceDate'], 'unique_student_subject_date');
            $table->index(['studentId', 'attendanceDate']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance');
    }
};

