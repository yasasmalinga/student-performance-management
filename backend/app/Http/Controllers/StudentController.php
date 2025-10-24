<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\StudentTestResult;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::with(['user', 'gradeLevel']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('userName', 'like', "%{$search}%")
                  ->orWhere('userEmail', 'like', "%{$search}%");
            })->orWhere('studentNumber', 'like', "%{$search}%");
        }

        $students = $query->paginate(15);

        return response()->json($students);
    }

    public function store(Request $request)
    {
        // Log incoming request data
        \Log::info('📝 Student creation request:', $request->all());
        
        try {
            $validated = $request->validate([
                'userName' => 'required|string|max:100',
                'password' => 'required|string|min:6',
                'userEmail' => 'required|email|unique:users,userEmail',
                'userContact' => 'nullable|string|max:20',
                'studentNumber' => 'required|string|max:20|unique:students,studentNumber',
                'dateOfBirth' => 'nullable|date',
                'enrollmentDate' => 'nullable|date',
                'gradeId' => 'nullable|exists:grades,gradeId',
                'grade' => 'nullable|string|max:20',
                'section' => 'nullable|string|max:10',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Create user
            $user = User::create([
                'userName' => $validated['userName'],
                'password' => Hash::make($validated['password']),
                'userType' => User::TYPE_STUDENT, // 3 = Student
                'userEmail' => $validated['userEmail'],
                'userContact' => $validated['userContact'] ?? null,
            ]);

            // Create student record
            $gradeId = isset($validated['gradeId']) ? (int)$validated['gradeId'] : null;
            \Log::info('💾 Creating student with gradeId: ' . ($gradeId ?? 'NULL'));
            
            $student = Student::create([
                'userId' => $user->userId,
                'studentNumber' => $validated['studentNumber'],
                'dateOfBirth' => $validated['dateOfBirth'] ?? null,
                'enrollmentDate' => $validated['enrollmentDate'] ?? null,
                'gradeId' => $gradeId,
                'grade' => $validated['grade'] ?? null,
                'section' => $validated['section'] ?? null,
            ]);

            DB::commit();
            
            // Load user relationship
            $student->load('user');
            
            return response()->json([
                'message' => 'Student created successfully',
                'student' => $student
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Student creation failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to create student',
                'error' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTraceAsString() : null
            ], 500);
        }
    }

    public function show($id)
    {
        $student = Student::with(['user', 'parent', 'testResults.test.subject', 'attendance'])
            ->findOrFail($id);
        
        return response()->json($student);
    }

    public function update(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            // First get the student to access userId
            $student = Student::with('user')->findOrFail($id);
            
            // Now validate with correct IDs
            $validated = $request->validate([
                'userName' => 'sometimes|string|max:100',
                'password' => 'sometimes|string|min:6',
                'userEmail' => 'sometimes|email|unique:users,userEmail,' . $student->userId . ',userId',
                'userContact' => 'nullable|string|max:20',
                'studentNumber' => 'sometimes|string|max:20|unique:students,studentNumber,' . $id . ',studentId',
                'dateOfBirth' => 'nullable|date',
                'enrollmentDate' => 'nullable|date',
                'gradeId' => 'nullable|exists:grades,gradeId',
                'grade' => 'nullable|string|max:20',
                'section' => 'nullable|string|max:10',
            ]);
            
            // Update user information if provided
            $userUpdates = [];
            if (isset($validated['userName'])) $userUpdates['userName'] = $validated['userName'];
            if (isset($validated['password'])) $userUpdates['password'] = Hash::make($validated['password']);
            if (isset($validated['userEmail'])) $userUpdates['userEmail'] = $validated['userEmail'];
            if (isset($validated['userContact'])) $userUpdates['userContact'] = $validated['userContact'];
            
            if (!empty($userUpdates)) {
                $student->user->update($userUpdates);
            }

            // Update student information
            $studentUpdates = [];
            if (isset($validated['studentNumber'])) $studentUpdates['studentNumber'] = $validated['studentNumber'];
            if (isset($validated['dateOfBirth'])) $studentUpdates['dateOfBirth'] = $validated['dateOfBirth'];
            if (isset($validated['enrollmentDate'])) $studentUpdates['enrollmentDate'] = $validated['enrollmentDate'];
            if (isset($validated['gradeId'])) $studentUpdates['gradeId'] = $validated['gradeId'];
            if (isset($validated['grade'])) $studentUpdates['grade'] = $validated['grade'];
            if (isset($validated['section'])) $studentUpdates['section'] = $validated['section'];
            
            if (!empty($studentUpdates)) {
                $student->update($studentUpdates);
            }

            DB::commit();
            
            // Reload relationships
            $student->load('user', 'parent');
            
            return response()->json([
                'message' => 'Student updated successfully',
                'student' => $student
            ]);
            
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Student update failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update student',
                'error' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTraceAsString() : null
            ], 500);
        }
    }

    public function updateParent(Request $request, $id)
    {
        $validated = $request->validate([
            'parentId' => 'nullable|exists:users,userId',
        ]);

        try {
            $student = Student::findOrFail($id);
            $student->update(['parentId' => $validated['parentId']]);

            return response()->json([
                'message' => 'Student parent updated successfully',
                'student' => $student->load('user', 'parent')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update student parent',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function performance($id)
    {
        $student = Student::findOrFail($id);

        $testResults = StudentTestResult::where('studentId', $id)
            ->with(['test.subject'])
            ->get();

        $averageMarks = $testResults->avg('marksObtained');
        $totalTests = $testResults->count();

        $subjectPerformance = $testResults->groupBy('test.subjectId')->map(function($results) {
            return [
                'subject' => $results->first()->test->subject->subjectName,
                'averageMarks' => $results->avg('marksObtained'),
                'totalTests' => $results->count(),
            ];
        })->values();

        return response()->json([
            'student' => $student->load('user'),
            'averageMarks' => round($averageMarks, 2),
            'totalTests' => $totalTests,
            'subjectPerformance' => $subjectPerformance,
            'recentResults' => $testResults->take(10),
        ]);
    }

    public function addTestResult(Request $request, $id)
    {
        $student = Student::findOrFail($id);

        $validated = $request->validate([
            'testId' => 'required|exists:tests,testId',
            'marksObtained' => 'required|integer',
            'grade' => 'nullable|string|max:5',
            'remarks' => 'nullable|string',
        ]);

        $result = StudentTestResult::create([
            'studentId' => $id,
            'testId' => $validated['testId'],
            'marksObtained' => $validated['marksObtained'],
            'grade' => $validated['grade'] ?? null,
            'remarks' => $validated['remarks'] ?? null,
        ]);

        return response()->json($result, 201);
    }

    public function updateTestResult(Request $request, $studentId, $resultId)
    {
        $result = StudentTestResult::where('studentId', $studentId)
            ->where('resultId', $resultId)
            ->firstOrFail();

        $validated = $request->validate([
            'marksObtained' => 'sometimes|integer',
            'grade' => 'nullable|string|max:5',
            'remarks' => 'nullable|string',
        ]);

        $result->update($validated);

        return response()->json($result);
    }

    public function deleteTestResult($studentId, $resultId)
    {
        $result = StudentTestResult::where('studentId', $studentId)
            ->where('resultId', $resultId)
            ->firstOrFail();

        $result->delete();

        return response()->json(['message' => 'Test result deleted successfully']);
    }

    public function report($id)
    {
        $student = Student::with('user')->findOrFail($id);

        $testResults = StudentTestResult::where('studentId', $id)
            ->with(['test.subject'])
            ->join('tests', 'student_test_results.testId', '=', 'tests.testId')
            ->orderBy('tests.testDate', 'desc')
            ->select('student_test_results.*')
            ->get();

        // Get individual attendance records
        $attendanceRecords = DB::table('attendance')
            ->where('studentId', $id)
            ->select('attendanceId', 'status', 'attendanceDate', 'subjectId')
            ->orderBy('attendanceDate', 'desc')
            ->get();

        // Get attendance summary by subject
        $attendanceSummary = DB::table('attendance')
            ->join('subjects', 'attendance.subjectId', '=', 'subjects.subjectId')
            ->where('attendance.studentId', $id)
            ->select(
                'subjects.subjectName',
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN status = "Present" THEN 1 ELSE 0 END) as present'),
                DB::raw('SUM(CASE WHEN status = "Absent" THEN 1 ELSE 0 END) as absent')
            )
            ->groupBy('subjects.subjectId', 'subjects.subjectName')
            ->get();

        return response()->json([
            'student' => $student,
            'testResults' => $testResults,
            'attendance' => $attendanceRecords,
            'attendanceSummary' => $attendanceSummary,
            'summary' => [
                'totalTests' => $testResults->count(),
                'averageMarks' => round($testResults->avg('marksObtained'), 2),
                'highestMark' => $testResults->max('marksObtained'),
                'lowestMark' => $testResults->min('marksObtained'),
            ]
        ]);
    }
}

