<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_test_results', function (Blueprint $table) {
            $table->id('resultId');
            $table->unsignedBigInteger('studentId');
            $table->unsignedBigInteger('testId');
            $table->integer('marksObtained')->nullable();
            $table->string('grade', 5)->nullable();
            $table->text('remarks')->nullable();
            
            $table->foreign('studentId')->references('studentId')->on('students')->onDelete('cascade');
            $table->foreign('testId')->references('testId')->on('tests')->onDelete('cascade');
            
            $table->unique(['studentId', 'testId'], 'unique_student_test');
            $table->index('studentId');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_test_results');
    }
};

