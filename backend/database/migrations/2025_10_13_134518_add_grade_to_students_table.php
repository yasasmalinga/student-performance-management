<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->string('grade', 20)->nullable()->after('enrollmentDate'); // e.g., 'Grade 10A', 'Grade 11B'
            $table->string('section', 10)->nullable()->after('grade'); // e.g., 'A', 'B', 'C'
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn(['grade', 'section']);
        });
    }
};
