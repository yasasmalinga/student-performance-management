<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parents', function (Blueprint $table) {
            $table->id('parentId');
            $table->unsignedBigInteger('userId');
            $table->unsignedBigInteger('studentId')->nullable();
            $table->string('occupation', 100)->nullable();
            
            $table->foreign('userId')->references('userId')->on('users')->onDelete('cascade');
            $table->foreign('studentId')->references('studentId')->on('students')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parents');
    }
};

