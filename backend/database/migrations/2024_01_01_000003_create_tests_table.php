<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tests', function (Blueprint $table) {
            $table->id('testId');
            $table->tinyInteger('testType')->comment('1: Exam, 2: Non-Academic');
            $table->integer('testMark')->nullable();
            $table->date('testDate');
            $table->integer('subjectRank')->nullable();
            $table->unsignedBigInteger('subjectId')->nullable();
            $table->unsignedBigInteger('teacherId')->nullable();
            $table->timestamps();
            
            $table->foreign('subjectId')->references('subjectId')->on('subjects')->onDelete('cascade');
            $table->foreign('teacherId')->references('userId')->on('users')->onDelete('cascade');
            
            $table->index('testDate');
            $table->index('testType');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tests');
    }
};

