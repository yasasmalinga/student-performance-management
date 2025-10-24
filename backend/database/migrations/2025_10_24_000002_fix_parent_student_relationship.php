<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Fix Parent-Student relationship (one parent can have multiple children)
        
        // 1. Remove the studentId column from parents table
        Schema::table('parents', function (Blueprint $table) {
            // Check if foreign key exists before dropping
            if (Schema::hasColumn('parents', 'studentId')) {
                $table->dropForeign(['studentId']);
                $table->dropColumn('studentId');
            }
        });
    }

    public function down(): void
    {
        // Add back studentId to parents table
        Schema::table('parents', function (Blueprint $table) {
            $table->unsignedBigInteger('studentId')->nullable()->after('userId');
            $table->foreign('studentId')->references('studentId')->on('students')->onDelete('set null');
        });
    }
};
