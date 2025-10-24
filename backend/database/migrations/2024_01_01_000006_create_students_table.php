<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id('studentId');
            $table->unsignedBigInteger('userId');
            $table->unsignedBigInteger('parentId')->nullable();
            $table->string('studentNumber', 20)->unique()->nullable();
            $table->date('dateOfBirth')->nullable();
            $table->date('enrollmentDate')->nullable();
            
            $table->foreign('userId')->references('userId')->on('users')->onDelete('cascade');
            $table->foreign('parentId')->references('userId')->on('users')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};

