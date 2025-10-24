<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id('userId');
            $table->string('userName', 100);
            $table->string('password');
            $table->tinyInteger('userType')->comment('1: Admin, 2: Teacher, 3: Student, 4: Parent');
            $table->string('userEmail', 100)->unique();
            $table->string('userContact', 20)->nullable();
            $table->timestamps();
            
            $table->index('userEmail');
            $table->index('userType');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};

