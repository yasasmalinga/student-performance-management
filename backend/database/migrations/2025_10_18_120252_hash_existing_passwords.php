<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Hash all existing plain text passwords
        $users = DB::table('users')->get();
        
        foreach ($users as $user) {
            // Check if password is already hashed (Laravel hashes start with $2y$)
            if (!str_starts_with($user->password, '$2y$')) {
                DB::table('users')
                    ->where('userId', $user->userId)
                    ->update(['password' => Hash::make($user->password)]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Note: This migration cannot be reversed as we cannot unhash passwords
        // In a real scenario, you would need to restore from a backup
        throw new Exception('This migration cannot be reversed. Passwords have been hashed.');
    }
};
