<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Admin;
use App\Models\Teacher;
use App\Models\Student;
use App\Models\ParentModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::query();

        if ($request->has('userType')) {
            $query->where('userType', $request->userType);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('userName', 'like', "%{$search}%")
                  ->orWhere('userEmail', 'like', "%{$search}%");
            });
        }

        $users = $query->with(['admin', 'teacher', 'student', 'parent'])->paginate(15);

        return response()->json($users);
    }

    public function show($id)
    {
        $user = User::with(['admin', 'teacher', 'student', 'parent'])->findOrFail($id);
        return response()->json($user);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'userName' => 'required|string|max:100',
            'password' => 'required|string|min:6',
            'userType' => 'required|integer|in:1,2,3,4',
            'userEmail' => 'required|email|unique:users,userEmail',
            'userContact' => 'nullable|string|max:20',
            
            // Admin fields
            'adminLevel' => 'required_if:userType,1|integer|in:1,2',
            
            // Teacher fields
            'employeeNumber' => 'required_if:userType,2|string|max:20|unique:teachers,employeeNumber',
            'department' => 'nullable|string|max:100',
            'specialization' => 'nullable|string|max:100',
            
            // Student fields
            'studentNumber' => 'required_if:userType,3|string|max:20|unique:students,studentNumber',
            'dateOfBirth' => 'nullable|date',
            'enrollmentDate' => 'nullable|date',
            'parentId' => 'nullable|exists:users,userId',
            
            // Parent fields
            'occupation' => 'nullable|string|max:100',
            'studentId' => 'nullable|exists:students,studentId',
        ]);

        DB::beginTransaction();
        try {
            $user = User::create([
                'userName' => $validated['userName'],
                'password' => Hash::make($validated['password']),
                'userType' => $validated['userType'],
                'userEmail' => $validated['userEmail'],
                'userContact' => $validated['userContact'] ?? null,
            ]);

            // Create role-specific record
            switch ($user->userType) {
                case User::TYPE_ADMIN:
                    Admin::create([
                        'userId' => $user->userId,
                        'adminLevel' => $validated['adminLevel'],
                    ]);
                    break;
                    
                case User::TYPE_TEACHER:
                    Teacher::create([
                        'userId' => $user->userId,
                        'employeeNumber' => $validated['employeeNumber'],
                        'department' => $validated['department'] ?? null,
                        'specialization' => $validated['specialization'] ?? null,
                    ]);
                    break;
                    
                case User::TYPE_STUDENT:
                    Student::create([
                        'userId' => $user->userId,
                        'studentNumber' => $validated['studentNumber'],
                        'dateOfBirth' => $validated['dateOfBirth'] ?? null,
                        'enrollmentDate' => $validated['enrollmentDate'] ?? null,
                        'parentId' => $validated['parentId'] ?? null,
                    ]);
                    break;
                    
                case User::TYPE_PARENT:
                    ParentModel::create([
                        'userId' => $user->userId,
                        'occupation' => $validated['occupation'] ?? null,
                        'studentId' => $validated['studentId'] ?? null,
                    ]);
                    break;
            }

            DB::commit();
            
            $user->load(['admin', 'teacher', 'student', 'parent']);
            return response()->json($user, 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create user: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'userName' => 'sometimes|string|max:100',
            'password' => 'sometimes|string|min:6',
            'userEmail' => 'sometimes|email|unique:users,userEmail,' . $id . ',userId',
            'userContact' => 'nullable|string|max:20',
        ]);

        // Hash password if provided
        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json($user);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    public function search(Request $request)
    {
        $searchTerm = $request->input('q', '');
        
        $users = User::where('userName', 'like', "%{$searchTerm}%")
            ->orWhere('userEmail', 'like', "%{$searchTerm}%")
            ->with(['admin', 'teacher', 'student', 'parent'])
            ->limit(20)
            ->get();

        return response()->json($users);
    }
}

