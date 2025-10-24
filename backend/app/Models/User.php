<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';
    protected $primaryKey = 'userId';
    
    const CREATED_AT = 'created_at';
    const UPDATED_AT = 'updated_at';

    protected $fillable = [
        'userName',
        'password',
        'userType',
        'userEmail',
        'userContact',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'userType' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // User type constants
    const TYPE_ADMIN = 1;
    const TYPE_TEACHER = 2;
    const TYPE_STUDENT = 3;
    const TYPE_PARENT = 4;

    // Relationships
    public function admin()
    {
        return $this->hasOne(Admin::class, 'userId', 'userId');
    }

    public function teacher()
    {
        return $this->hasOne(Teacher::class, 'userId', 'userId');
    }

    public function student()
    {
        return $this->hasOne(Student::class, 'userId', 'userId');
    }

    public function parent()
    {
        return $this->hasOne(ParentModel::class, 'userId', 'userId');
    }

    // Helper methods
    public function isAdmin(): bool
    {
        return $this->userType === self::TYPE_ADMIN;
    }

    public function isTeacher(): bool
    {
        return $this->userType === self::TYPE_TEACHER;
    }

    public function isStudent(): bool
    {
        return $this->userType === self::TYPE_STUDENT;
    }

    public function isParent(): bool
    {
        return $this->userType === self::TYPE_PARENT;
    }
}

