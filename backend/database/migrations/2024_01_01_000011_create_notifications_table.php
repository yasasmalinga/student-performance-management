<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id('notificationId');
            $table->unsignedBigInteger('subjectId')->nullable();
            $table->unsignedBigInteger('studentId')->nullable();
            $table->string('title', 200);
            $table->text('message');
            $table->tinyInteger('notificationType')->comment('1: Academic, 2: Non-Academic, 3: General');
            $table->boolean('isRead')->default(false);
            $table->timestamp('createdAt')->useCurrent();
            
            $table->foreign('subjectId')->references('subjectId')->on('subjects')->onDelete('cascade');
            $table->foreign('studentId')->references('studentId')->on('students')->onDelete('cascade');
            
            $table->index('studentId');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};

