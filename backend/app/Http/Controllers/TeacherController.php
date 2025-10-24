<?php

namespace App\Http\Controllers;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

class TeacherController extends Controller
{
    public function index(Request $request)
    {
        $query = Teacher::with('user');

        if ($request->has('department')) {
            $query->where('department', $request->department);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('userName', 'like', "%{$search}%")
                  ->orWhere('userEmail', 'like', "%{$search}%");
            })->orWhere('employeeNumber', 'like', "%{$search}%");
        }

        $teachers = $query->paginate(15);

        return response()->json($teachers);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'userName' => 'required|string|max:255|unique:users,userName',
            'userEmail' => 'required|email|max:255|unique:users,userEmail',
            'userContact' => 'required|string|max:20',
            'password' => 'required|string|min:6',
            'employeeNumber' => 'required|string|max:50|unique:teachers,employeeNumber',
            'department' => 'required|string|max:255',
            'specialization' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Create user
            $user = User::create([
                'userName' => $request->userName,
                'userEmail' => $request->userEmail,
                'userContact' => $request->userContact,
                'password' => Hash::make($request->password),
                'userType' => User::TYPE_TEACHER, // 2 = Teacher
            ]);

            // Create teacher record
            $teacher = Teacher::create([
                'userId' => $user->userId,
                'employeeNumber' => $request->employeeNumber,
                'department' => $request->department,
                'specialization' => $request->specialization,
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Teacher created successfully',
                'teacher' => $teacher->load('user')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to create teacher',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        $teacher = Teacher::with(['user', 'subjects', 'tests'])
            ->findOrFail($id);
        
        return response()->json($teacher);
    }

    public function subjects($id)
    {
        $teacher = Teacher::findOrFail($id);
        $subjects = $teacher->subjects()->get();

        return response()->json($subjects);
    }

    public function tests($id)
    {
        $teacher = Teacher::findOrFail($id);
        $tests = $teacher->tests()
            ->with(['subject', 'exam', 'nonAcademic'])
            ->orderBy('testDate', 'desc')
            ->paginate(15);

        return response()->json($tests);
    }
}

