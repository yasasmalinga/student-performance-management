<?php

namespace App\Http\Controllers;

use App\Models\Test;
use App\Models\Exam;
use App\Models\NonAcademic;
use App\Models\StudentTestResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TestController extends Controller
{
    public function index(Request $request)
    {
        $query = Test::query();

        if ($request->has('testType')) {
            $query->where('testType', $request->testType);
        }

        if ($request->has('subjectId')) {
            $query->where('subjectId', $request->subjectId);
        }

        if ($request->has('teacherId')) {
            $query->where('teacherId', $request->teacherId);
        }

        $tests = $query->with(['subject', 'teacher', 'exam', 'nonAcademic'])
            ->orderBy('testDate', 'desc')
            ->paginate(15);

        return response()->json($tests);
    }

    public function show($id)
    {
        $test = Test::with(['subject', 'teacher', 'exam', 'nonAcademic', 'studentResults.student.user'])
            ->findOrFail($id);
        
        return response()->json($test);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'testType' => 'required|integer|in:1,2',
            'testMark' => 'nullable|integer',
            'testDate' => 'required|date',
            'subjectRank' => 'nullable|integer',
            'subjectId' => 'nullable|exists:subjects,subjectId',
            'teacherId' => 'nullable|exists:users,userId',
            
            // Exam fields
            'testClass' => 'required_if:testType,1|integer',
            'testDescription' => 'nullable|string',
            
            // Non-Academic fields
            'eventType' => 'required_if:testType,2|integer',
            'eventDate' => 'required_if:testType,2|date',
            'rank' => 'nullable|integer',
            'eventDescription' => 'nullable|string',
            'eventLevel' => 'nullable|string|max:50',
        ]);

        DB::beginTransaction();
        try {
            $test = Test::create([
                'testType' => $validated['testType'],
                'testMark' => $validated['testMark'] ?? null,
                'testDate' => $validated['testDate'],
                'subjectRank' => $validated['subjectRank'] ?? null,
                'subjectId' => $validated['subjectId'] ?? null,
                'teacherId' => $validated['teacherId'] ?? null,
            ]);

            if ($test->testType == Test::TYPE_EXAM) {
                Exam::create([
                    'testId' => $test->testId,
                    'testClass' => $validated['testClass'],
                    'testDescription' => $validated['testDescription'] ?? null,
                ]);
            } elseif ($test->testType == Test::TYPE_NON_ACADEMIC) {
                NonAcademic::create([
                    'testId' => $test->testId,
                    'eventType' => $validated['eventType'],
                    'eventDate' => $validated['eventDate'],
                    'rank' => $validated['rank'] ?? null,
                    'eventDescription' => $validated['eventDescription'] ?? null,
                    'eventLevel' => $validated['eventLevel'] ?? null,
                ]);
            }

            DB::commit();
            
            $test->load(['subject', 'teacher', 'exam', 'nonAcademic']);
            return response()->json($test, 201);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Failed to create test: ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        DB::beginTransaction();
        try {
            $test = Test::with(['exam', 'nonAcademic'])->findOrFail($id);

            $validated = $request->validate([
                'testMark' => 'sometimes|integer',
                'testDate' => 'sometimes|date',
                'subjectRank' => 'nullable|integer',
                'testDescription' => 'nullable|string',
            ]);

            // Update test base fields
            $testUpdates = [];
            if (isset($validated['testMark'])) $testUpdates['testMark'] = $validated['testMark'];
            if (isset($validated['testDate'])) $testUpdates['testDate'] = $validated['testDate'];
            if (isset($validated['subjectRank'])) $testUpdates['subjectRank'] = $validated['subjectRank'];

            if (!empty($testUpdates)) {
                $test->update($testUpdates);
            }

            // Update description in exam or nonAcademic table
            if (isset($validated['testDescription'])) {
                if ($test->testType == Test::TYPE_EXAM && $test->exam) {
                    $test->exam->update(['testDescription' => $validated['testDescription']]);
                } elseif ($test->testType == Test::TYPE_NON_ACADEMIC && $test->nonAcademic) {
                    $test->nonAcademic->update(['eventDescription' => $validated['testDescription']]);
                }
            }

            DB::commit();
            
            return response()->json([
                'message' => 'Test updated successfully',
                'test' => $test->load(['exam', 'nonAcademic', 'subject', 'teacher'])
            ]);
            
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to update test',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $test = Test::findOrFail($id);
        $test->delete();

        return response()->json(['message' => 'Test deleted successfully']);
    }

    public function getResults($id)
    {
        $test = Test::findOrFail($id);
        
        $results = StudentTestResult::where('testId', $id)
            ->with(['student.user'])
            ->get()
            ->map(function($result) {
                return [
                    'resultId' => $result->resultId,
                    'studentId' => $result->studentId,
                    'studentNumber' => $result->student->studentNumber,
                    'studentName' => $result->student->user->userName,
                    'marksObtained' => $result->marksObtained,
                    'grade' => $result->grade,
                    'remarks' => $result->remarks,
                ];
            });

        return response()->json($results);
    }

    public function addResult(Request $request, $id)
    {
        $test = Test::findOrFail($id);

        $validated = $request->validate([
            'studentId' => 'required|exists:students,studentId',
            'marksObtained' => 'required|integer',
            'grade' => 'nullable|string|max:5',
            'remarks' => 'nullable|string',
        ]);

        $result = StudentTestResult::updateOrCreate(
            [
                'testId' => $id,
                'studentId' => $validated['studentId']
            ],
            [
                'marksObtained' => $validated['marksObtained'],
                'grade' => $validated['grade'] ?? null,
                'remarks' => $validated['remarks'] ?? null,
            ]
        );

        return response()->json([
            'message' => 'Student result saved successfully',
            'result' => $result
        ], 201);
    }

    public function addStudentResult(Request $request, $id)
    {
        $test = Test::findOrFail($id);

        $validated = $request->validate([
            'studentId' => 'required|exists:students,studentId',
            'marksObtained' => 'required|integer',
            'grade' => 'nullable|string|max:5',
            'remarks' => 'nullable|string',
        ]);

        $test->students()->syncWithoutDetaching([
            $validated['studentId'] => [
                'marksObtained' => $validated['marksObtained'],
                'grade' => $validated['grade'] ?? null,
                'remarks' => $validated['remarks'] ?? null,
            ]
        ]);

        return response()->json(['message' => 'Student result added successfully']);
    }
}

