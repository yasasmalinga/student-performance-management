<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teacher_subjects', function (Blueprint $table) {
            $table->id('assignmentId');
            $table->unsignedBigInteger('teacherId');
            $table->unsignedBigInteger('subjectId');
            $table->date('assignedDate')->useCurrent();
            
            $table->foreign('teacherId')->references('userId')->on('users')->onDelete('cascade');
            $table->foreign('subjectId')->references('subjectId')->on('subjects')->onDelete('cascade');
            
            $table->unique(['teacherId', 'subjectId'], 'unique_teacher_subject');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teacher_subjects');
    }
};

