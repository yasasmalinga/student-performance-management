<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\TestController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TeacherController;
use App\Http\Controllers\ParentController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\GradeController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::post('/auth/me', [AuthController::class, 'me']);

// Temporary public access for testing (remove in production)
Route::get('/users', [UserController::class, 'index']); // Get all users (for testing)
Route::get('/students', [StudentController::class, 'index']);
Route::post('/students', [StudentController::class, 'store']); // Create student
Route::get('/students/without-parents', [ParentController::class, 'getStudents']); // Get students without parents
Route::get('/students/{id}', [StudentController::class, 'show']); // Get student details
Route::get('/students/{id}/performance', [StudentController::class, 'performance']); // Get student performance
Route::get('/students/{id}/report', [StudentController::class, 'report']); // Get student report
Route::get('/students/{id}/test-results', [StudentController::class, 'getTestResults']); // Get student test results
Route::put('/students/{id}', [StudentController::class, 'update']); // Update student
Route::put('/students/{id}/parent', [StudentController::class, 'updateParent']); // Update student's parent
Route::get('/subjects', [SubjectController::class, 'index']);
Route::get('/subjects/{id}', [SubjectController::class, 'show']); // Get subject details
Route::post('/subjects', [SubjectController::class, 'store']); // Create subject
Route::put('/subjects/{id}', [SubjectController::class, 'update']); // Update subject
Route::delete('/subjects/{id}', [SubjectController::class, 'destroy']); // Delete subject
Route::get('/parents', [ParentController::class, 'index']); // Get all parents
Route::post('/parents', [ParentController::class, 'store']); // Create parent
Route::get('/parents/{id}', [ParentController::class, 'show']); // Get parent details
Route::get('/parents/by-user/{userId}', [ParentController::class, 'getByUserId']); // Get parent by user ID
Route::put('/parents/{id}', [ParentController::class, 'update']); // Update parent
Route::post('/parents/{id}/assign-student', [ParentController::class, 'linkToStudent']); // Assign student to parent
Route::get('/attendance', [AttendanceController::class, 'index']); // Get all attendance records (for testing)
Route::get('/attendance/statistics/{studentId}', [AttendanceController::class, 'statistics']); // Get attendance statistics
Route::get('/attendance/months/{studentId}', [AttendanceController::class, 'getAvailableMonths']); // Get available months for student
Route::post('/attendance/bulk', [AttendanceController::class, 'bulkStore']); // Bulk save attendance
Route::get('/attendance/by-date/{date}', [AttendanceController::class, 'getByDate']); // Get attendance by date
Route::get('/tests', [TestController::class, 'index']); // Get all tests
Route::get('/teachers', [TeacherController::class, 'index']); // Get all teachers (for testing)
Route::post('/teachers', [TeacherController::class, 'store']); // Create teacher (for testing)
Route::get('/teachers/{id}', [TeacherController::class, 'show']); // Get teacher details
Route::get('/grades', [GradeController::class, 'index']); // Get all grades
Route::post('/grades', [GradeController::class, 'store']); // Create grade
Route::post('/tests', [TestController::class, 'store']); // Create test
Route::put('/tests/{id}', [TestController::class, 'update']); // Update test
Route::get('/tests/{id}/results', [TestController::class, 'getResults']); // Get test results
Route::post('/tests/{id}/results', [TestController::class, 'addResult']); // Add test result
Route::get('/reports/attendance', [ReportController::class, 'attendanceReport']); // Attendance report
Route::get('/reports/overall-performance', [ReportController::class, 'overallPerformance']); // Overall performance report
Route::get('/reports/subject-performance/{subjectId}', [ReportController::class, 'subjectPerformance']); // Subject performance report

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    
    // Authentication
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Users (Admin only for most operations) - index moved to public routes for testing
    Route::get('/users/search', [UserController::class, 'search']);
    Route::get('/users/{id}', [UserController::class, 'show']);
    Route::post('/users', [UserController::class, 'store'])
        ->middleware('check.usertype:1'); // Admin only
    Route::put('/users/{id}', [UserController::class, 'update'])
        ->middleware('check.usertype:1'); // Admin only
    Route::delete('/users/{id}', [UserController::class, 'destroy'])
        ->middleware('check.usertype:1'); // Admin only

    // Subjects (all moved to public routes for testing)
    // Route::get('/subjects', [SubjectController::class, 'index']);
    // Route::get('/subjects/{id}', [SubjectController::class, 'show']);
    // Route::post('/subjects', [SubjectController::class, 'store']);
    // Route::put('/subjects/{id}', [SubjectController::class, 'update']);
    // Route::delete('/subjects/{id}', [SubjectController::class, 'destroy']);
    Route::post('/subjects/{id}/assign-teacher', [SubjectController::class, 'assignTeacher'])
        ->middleware('check.usertype:1'); // Admin only
    Route::post('/subjects/{id}/remove-teacher', [SubjectController::class, 'removeTeacher'])
        ->middleware('check.usertype:1'); // Admin only

    // Tests (index, store, update, results moved to public routes for testing)
    // Route::get('/tests', [TestController::class, 'index']);
    // Route::post('/tests', [TestController::class, 'store']);
    // Route::put('/tests/{id}', [TestController::class, 'update']);
    Route::get('/tests/{id}', [TestController::class, 'show']);
    Route::delete('/tests/{id}', [TestController::class, 'destroy'])
        ->middleware('check.usertype:1,2'); // Admin and Teacher
    Route::post('/tests/{id}/add-result', [TestController::class, 'addStudentResult'])
        ->middleware('check.usertype:1,2'); // Admin and Teacher

    // Attendance (index and bulk moved to public routes for testing)
    Route::get('/attendance/{id}', [AttendanceController::class, 'show']);
    Route::post('/attendance', [AttendanceController::class, 'store'])
        ->middleware('check.usertype:1,2'); // Admin and Teacher
    // Route::post('/attendance/bulk', [AttendanceController::class, 'bulkStore'])
    Route::put('/attendance/{id}', [AttendanceController::class, 'update'])
        ->middleware('check.usertype:1,2'); // Admin and Teacher
    Route::delete('/attendance/{id}', [AttendanceController::class, 'destroy'])
        ->middleware('check.usertype:1,2'); // Admin and Teacher

    // Students (index, show, performance, and report moved to public routes for testing)
    // Route::get('/students', [StudentController::class, 'index']);
    // Route::get('/students/{id}', [StudentController::class, 'show']);
    // Route::get('/students/{id}/performance', [StudentController::class, 'performance']);
    // Route::get('/students/{id}/report', [StudentController::class, 'report']);
    Route::post('/students/{id}/test-results', [StudentController::class, 'addTestResult'])
        ->middleware('check.usertype:1,2'); // Admin and Teacher
    Route::put('/students/{studentId}/test-results/{resultId}', [StudentController::class, 'updateTestResult'])
        ->middleware('check.usertype:1,2'); // Admin and Teacher
    Route::delete('/students/{studentId}/test-results/{resultId}', [StudentController::class, 'deleteTestResult'])
        ->middleware('check.usertype:1,2'); // Admin and Teacher

    // Teachers (index, store, show moved to public routes for testing)
    Route::get('/teachers/{id}/subjects', [TeacherController::class, 'subjects']);
    Route::get('/teachers/{id}/tests', [TeacherController::class, 'tests']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/{id}', [NotificationController::class, 'show']);
    Route::post('/notifications', [NotificationController::class, 'store'])
        ->middleware('check.usertype:1,2'); // Admin and Teacher
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::get('/notifications/unread-count/{studentId}', [NotificationController::class, 'unreadCount']);

    // Reports (moved to public routes for testing)
    // Route::get('/reports/overall-performance', [ReportController::class, 'overallPerformance'])
    // Route::get('/reports/subject-performance/{subjectId}', [ReportController::class, 'subjectPerformance'])
    // Route::get('/reports/attendance', [ReportController::class, 'attendanceReport'])
    Route::get('/reports/class/{testClass}', [ReportController::class, 'classReport'])
        ->middleware('check.usertype:1,2'); // Admin and Teacher
    Route::get('/reports/student/{studentId}/comprehensive', [ReportController::class, 'studentComprehensiveReport']);
});

// Fallback route
Route::fallback(function () {
    return response()->json(['error' => 'Route not found'], 404);
});

