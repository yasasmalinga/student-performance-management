<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $query = Attendance::query();

        if ($request->has('studentId')) {
            $query->where('studentId', $request->studentId);
        }

        if ($request->has('subjectId')) {
            $query->where('subjectId', $request->subjectId);
        }

        if ($request->has('teacherId')) {
            $query->where('teacherId', $request->teacherId);
        }

        if ($request->has('date_from')) {
            $query->where('attendanceDate', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('attendanceDate', '<=', $request->date_to);
        }

        $attendance = $query->with(['student.user', 'subject', 'teacher'])
            ->orderBy('attendanceDate', 'desc')
            ->paginate(15);

        return response()->json($attendance);
    }

    public function show($id)
    {
        $attendance = Attendance::with(['student.user', 'subject', 'teacher'])
            ->findOrFail($id);
        
        return response()->json($attendance);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'studentId' => 'required|exists:students,studentId',
            'subjectId' => 'required|exists:subjects,subjectId',
            'attendanceDate' => 'required|date',
            'status' => 'required|in:Present,Absent,Late,Excused',
            'remarks' => 'nullable|string',
            'teacherId' => 'nullable|exists:users,userId',
        ]);

        $attendance = Attendance::create($validated);

        return response()->json($attendance, 201);
    }

    public function update(Request $request, $id)
    {
        $attendance = Attendance::findOrFail($id);

        $validated = $request->validate([
            'status' => 'sometimes|in:Present,Absent,Late,Excused',
            'remarks' => 'nullable|string',
        ]);

        $attendance->update($validated);

        return response()->json($attendance);
    }

    public function destroy($id)
    {
        $attendance = Attendance::findOrFail($id);
        $attendance->delete();

        return response()->json(['message' => 'Attendance record deleted successfully']);
    }

    public function bulkStore(Request $request)
    {
        $validated = $request->validate([
            'attendance' => 'required|array',
            'attendance.*.studentId' => 'required|exists:students,studentId',
            'attendance.*.subjectId' => 'required|exists:subjects,subjectId',
            'attendance.*.attendanceDate' => 'required|date',
            'attendance.*.status' => 'required|in:Present,Absent,Late,Excused',
            'attendance.*.remarks' => 'nullable|string',
            'attendance.*.teacherId' => 'nullable|exists:users,userId',
        ]);

        $records = [];
        $created = 0;
        $updated = 0;

        foreach ($validated['attendance'] as $record) {
            // Use updateOrCreate to handle duplicates
            $attendance = Attendance::updateOrCreate(
                [
                    'studentId' => $record['studentId'],
                    'subjectId' => $record['subjectId'],
                    'attendanceDate' => $record['attendanceDate'],
                ],
                [
                    'status' => $record['status'],
                    'remarks' => $record['remarks'] ?? null,
                    'teacherId' => $record['teacherId'] ?? null,
                ]
            );

            if ($attendance->wasRecentlyCreated) {
                $created++;
            } else {
                $updated++;
            }

            $records[] = $attendance;
        }

        return response()->json([
            'message' => "Attendance saved: {$created} created, {$updated} updated",
            'records' => $records,
            'created' => $created,
            'updated' => $updated
        ], 201);
    }

    public function getByDate($date)
    {
        $attendance = Attendance::where('attendanceDate', $date)
            ->with(['student.user', 'subject'])
            ->get();

        // Calculate statistics
        $total = $attendance->count();
        $present = $attendance->where('status', 'Present')->count();
        $absent = $attendance->where('status', 'Absent')->count();
        $late = $attendance->where('status', 'Late')->count();
        $attendanceRate = $total > 0 ? round(($present / $total) * 100, 1) : 0;

        return response()->json([
            'date' => $date,
            'records' => $attendance,
            'statistics' => [
                'total' => $total,
                'present' => $present,
                'absent' => $absent,
                'late' => $late,
                'attendanceRate' => $attendanceRate
            ]
        ]);
    }

    public function statistics(Request $request, $studentId)
    {
        $query = Attendance::where('studentId', $studentId);

        if ($request->has('subjectId')) {
            $query->where('subjectId', $request->subjectId);
        }

        $total = $query->count();
        $present = $query->where('status', 'Present')->count();
        $absent = $query->where('status', 'Absent')->count();
        $late = $query->where('status', 'Late')->count();
        $excused = $query->where('status', 'Excused')->count();

        $percentage = $total > 0 ? ($present / $total) * 100 : 0;

        return response()->json([
            'total' => $total,
            'present' => $present,
            'absent' => $absent,
            'late' => $late,
            'excused' => $excused,
            'percentage' => round($percentage, 2),
        ]);
    }
}

