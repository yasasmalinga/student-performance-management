<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ParentModel;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ParentController extends Controller
{
    public function index(Request $request)
    {
        $query = ParentModel::with(['user', 'students.user']);

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('user', function($q) use ($search) {
                $q->where('userName', 'like', "%{$search}%")
                  ->orWhere('userEmail', 'like', "%{$search}%");
            });
        }

        $parents = $query->get();

        return response()->json([
            'data' => $parents
        ]);
    }

    public function show($id)
    {
        try {
            $parent = ParentModel::with(['user', 'students.user'])->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'parent' => $parent
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Parent not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }

    public function getByUserId($userId)
    {
        try {
            $parent = ParentModel::with('user')
                ->where('userId', $userId)
                ->first();
            
            if (!$parent) {
                return response()->json([
                    'success' => false,
                    'message' => 'Parent not found for this user'
                ], 404);
            }
            
            // Get all students for this parent
            $students = Student::with('user')
                ->where('parentId', $userId)
                ->get();
            
            return response()->json([
                'success' => true,
                'parent' => $parent,
                'students' => $students
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get parent details',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'userName' => 'required|string|max:100',
                'password' => 'required|string|min:6',
                'userEmail' => 'required|email|unique:users,userEmail',
                'userContact' => 'nullable|string|max:20',
                'occupation' => 'nullable|string|max:100',
                'studentId' => 'nullable|exists:students,studentId',
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
                'userType' => User::TYPE_PARENT, // 4 = Parent
                'userEmail' => $validated['userEmail'],
                'userContact' => $validated['userContact'] ?? null,
            ]);

            // Create parent record
            $parent = ParentModel::create([
                'userId' => $user->userId,
                'occupation' => $validated['occupation'] ?? null,
            ]);

            // If studentId is provided, update the student's parentId
            if (isset($validated['studentId'])) {
                Student::where('studentId', $validated['studentId'])
                    ->update(['parentId' => $user->userId]);
            }

            DB::commit();
            
            // Load user relationship
            $parent->load('user', 'students');
            
            return response()->json([
                'message' => 'Parent created successfully',
                'parent' => $parent
            ], 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Parent creation failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to create parent',
                'error' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTraceAsString() : null
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $validated = $request->validate([
                'userName' => 'sometimes|required|string|max:100',
                'password' => 'sometimes|required|string|min:6',
                'userEmail' => 'sometimes|required|email|unique:users,userEmail,' . $id . ',userId',
                'userContact' => 'nullable|string|max:20',
                'occupation' => 'nullable|string|max:100',
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }

        DB::beginTransaction();
        try {
            $parent = ParentModel::with('user')->findOrFail($id);
            $user = $parent->user;

            // Update user information
            $userData = [];
            if (isset($validated['userName'])) {
                $userData['userName'] = $validated['userName'];
            }
            if (isset($validated['password'])) {
                $userData['password'] = Hash::make($validated['password']);
            }
            if (isset($validated['userEmail'])) {
                $userData['userEmail'] = $validated['userEmail'];
            }
            if (isset($validated['userContact'])) {
                $userData['userContact'] = $validated['userContact'];
            }

            if (!empty($userData)) {
                $user->update($userData);
            }

            // Update parent information
            $parentData = [];
            if (isset($validated['occupation'])) {
                $parentData['occupation'] = $validated['occupation'];
            }

            if (!empty($parentData)) {
                $parent->update($parentData);
            }

            DB::commit();
            
            // Load relationships
            $parent->load('user', 'students');
            
            return response()->json([
                'message' => 'Parent updated successfully',
                'parent' => $parent
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Parent update failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update parent',
                'error' => $e->getMessage(),
                'trace' => config('app.debug') ? $e->getTraceAsString() : null
            ], 500);
        }
    }

    public function linkToStudent(Request $request, $parentId)
    {
        $validated = $request->validate([
            'studentId' => 'required|exists:students,studentId',
        ]);

        try {
            $parent = ParentModel::findOrFail($parentId);
            
            // Update student's parentId (no need to update parent since we removed studentId field)
            Student::where('studentId', $validated['studentId'])
                ->update(['parentId' => $parent->userId]);

            return response()->json([
                'message' => 'Parent linked to student successfully',
                'parent' => $parent->load('user', 'students')
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to link parent to student',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        DB::beginTransaction();
        try {
            $parent = ParentModel::with('user')->findOrFail($id);
            $user = $parent->user;

            // Remove parent association from students
            Student::where('parentId', $user->userId)
                ->update(['parentId' => null]);

            // Delete parent record
            $parent->delete();

            // Delete user record
            $user->delete();

            DB::commit();

            return response()->json([
                'message' => 'Parent deleted successfully'
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Parent deletion failed: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to delete parent',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getStudents()
    {
        // Get all students without parents
        $students = Student::with('user')
            ->whereNull('parentId')
            ->get();

        return response()->json($students);
    }
}





