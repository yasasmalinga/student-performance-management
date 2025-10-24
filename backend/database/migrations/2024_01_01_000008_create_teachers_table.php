<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teachers', function (Blueprint $table) {
            $table->id('teacherId');
            $table->unsignedBigInteger('userId');
            $table->string('employeeNumber', 20)->unique()->nullable();
            $table->string('department', 100)->nullable();
            $table->string('specialization', 100)->nullable();
            
            $table->foreign('userId')->references('userId')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teachers');
    }
};

