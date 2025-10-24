<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admins', function (Blueprint $table) {
            $table->id('adminId');
            $table->unsignedBigInteger('userId');
            $table->tinyInteger('adminLevel')->default(1)->comment('1: Super Admin, 2: Admin');
            
            $table->foreign('userId')->references('userId')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admins');
    }
};

