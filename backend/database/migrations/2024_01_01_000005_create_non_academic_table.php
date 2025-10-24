<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('non_academic', function (Blueprint $table) {
            $table->id('nonAcademicId');
            $table->unsignedBigInteger('testId');
            $table->integer('eventType');
            $table->date('eventDate');
            $table->integer('rank')->nullable();
            $table->text('eventDescription')->nullable();
            $table->string('eventLevel', 50)->nullable();
            
            $table->foreign('testId')->references('testId')->on('tests')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('non_academic');
    }
};

