<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    public function index(Request $request)
    {
        $query = Subject::query();

        if ($request->has('subjectType')) {
            $query->where('subjectType', $request->subjectType);
        }

        $subjects = $query->with('teachers')->get();

        return response()->json($subjects);
    }

    public function show($id)
    {
        $subject = Subject::with(['teachers', 'tests'])->findOrFail($id);
        return response()->json($subject);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'subjectName' => 'required|string|max:100',
            'subjectType' => 'required|integer|in:1,2',
            'description' => 'nullable|string',
        ]);

        $subject = Subject::create($validated);

        return response()->json($subject, 201);
    }

    public function update(Request $request, $id)
    {
        $subject = Subject::findOrFail($id);

        $validated = $request->validate([
            'subjectName' => 'sometimes|string|max:100',
            'subjectType' => 'sometimes|integer|in:1,2',
            'description' => 'nullable|string',
        ]);

        $subject->update($validated);

        return response()->json($subject);
    }

    public function destroy($id)
    {
        $subject = Subject::findOrFail($id);
        $subject->delete();

        return response()->json(['message' => 'Subject deleted successfully']);
    }

    public function assignTeacher(Request $request, $id)
    {
        $subject = Subject::findOrFail($id);

        $validated = $request->validate([
            'teacherId' => 'required|exists:users,userId',
        ]);

        $subject->teachers()->syncWithoutDetaching([$validated['teacherId']]);

        return response()->json(['message' => 'Teacher assigned successfully']);
    }

    public function removeTeacher(Request $request, $id)
    {
        $subject = Subject::findOrFail($id);

        $validated = $request->validate([
            'teacherId' => 'required|exists:users,userId',
        ]);

        $subject->teachers()->detach($validated['teacherId']);

        return response()->json(['message' => 'Teacher removed successfully']);
    }
}

