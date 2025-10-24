<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    public function index()
    {
        $grades = Grade::where('isActive', true)->orderBy('gradeLevel')->get();
        return response()->json($grades);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'gradeName' => 'required|string|max:50|unique:grades,gradeName',
            'gradeLevel' => 'required|string|max:10',
            'description' => 'nullable|string',
            'isActive' => 'boolean',
        ]);

        $grade = Grade::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Grade created successfully',
            'grade' => $grade
        ], 201);
    }

    public function show($id)
    {
        $grade = Grade::with('students')->findOrFail($id);
        return response()->json($grade);
    }

    public function update(Request $request, $id)
    {
        $grade = Grade::findOrFail($id);

        $validated = $request->validate([
            'gradeName' => 'sometimes|string|max:50|unique:grades,gradeName,' . $id . ',gradeId',
            'gradeLevel' => 'sometimes|string|max:10',
            'description' => 'nullable|string',
            'isActive' => 'boolean',
        ]);

        $grade->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Grade updated successfully',
            'grade' => $grade
        ]);
    }

    public function destroy($id)
    {
        $grade = Grade::findOrFail($id);
        $grade->delete();

        return response()->json([
            'success' => true,
            'message' => 'Grade deleted successfully'
        ]);
    }
}

