<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Test;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function overallPerformance(Request $request)
    {
        $query = DB::table('students')
            ->join('users', 'students.userId', '=', 'users.userId')
            ->leftJoin('student_test_results', 'students.studentId', '=', 'student_test_results.studentId')
            ->select(
                'students.studentId',
                'students.studentNumber',
                'users.userName',
                'users.userEmail',
                DB::raw('AVG(student_test_results.marksObtained) as averageMarks'),
                DB::raw('COUNT(student_test_results.testId) as totalTests')
            )
            ->groupBy('students.studentId', 'students.studentNumber', 'users.userName', 'users.userEmail');

        if ($request->has('minAverage')) {
            $query->having('averageMarks', '>=', $request->minAverage);
        }

        $results = $query->get();

        return response()->json($results);
    }

    public function subjectPerformance(Request $request, $subjectId)
    {
        $subject = Subject::findOrFail($subjectId);

        $results = DB::table('students')
            ->join('users', 'students.userId', '=', 'users.userId')
            ->join('student_test_results', 'students.studentId', '=', 'student_test_results.studentId')
            ->join('tests', 'student_test_results.testId', '=', 'tests.testId')
            ->where('tests.subjectId', $subjectId)
            ->select(
                'students.studentId',
                'students.studentNumber',
                'users.userName',
                DB::raw('AVG(student_test_results.marksObtained) as averageMarks'),
                DB::raw('COUNT(student_test_results.testId) as totalTests'),
                DB::raw('MAX(student_test_results.marksObtained) as highestMark'),
                DB::raw('MIN(student_test_results.marksObtained) as lowestMark')
            )
            ->groupBy('students.studentId', 'students.studentNumber', 'users.userName')
            ->get();

        return response()->json([
            'subject' => $subject,
            'results' => $results,
        ]);
    }

    public function attendanceReport(Request $request)
    {
        $query = DB::table('students')
            ->join('users', 'students.userId', '=', 'users.userId')
            ->leftJoin('attendance', 'students.studentId', '=', 'attendance.studentId')
            ->select(
                'students.studentId',
                'students.studentNumber',
                'users.userName',
                DB::raw('COUNT(*) as totalDays'),
                DB::raw('SUM(CASE WHEN attendance.status = "Present" THEN 1 ELSE 0 END) as presentDays'),
                DB::raw('SUM(CASE WHEN attendance.status = "Absent" THEN 1 ELSE 0 END) as absentDays'),
                DB::raw('SUM(CASE WHEN attendance.status = "Late" THEN 1 ELSE 0 END) as lateDays'),
                DB::raw('ROUND((SUM(CASE WHEN attendance.status = "Present" THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as attendancePercentage')
            )
            ->groupBy('students.studentId', 'students.studentNumber', 'users.userName');

        if ($request->has('date_from')) {
            $query->where('attendance.attendanceDate', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('attendance.attendanceDate', '<=', $request->date_to);
        }

        $results = $query->get();

        return response()->json($results);
    }

    public function classReport(Request $request, $testClass)
    {
        $results = DB::table('students')
            ->join('users', 'students.userId', '=', 'users.userId')
            ->join('student_test_results', 'students.studentId', '=', 'student_test_results.studentId')
            ->join('tests', 'student_test_results.testId', '=', 'tests.testId')
            ->join('exams', 'tests.testId', '=', 'exams.testId')
            ->where('exams.testClass', $testClass)
            ->select(
                'students.studentId',
                'students.studentNumber',
                'users.userName',
                DB::raw('AVG(student_test_results.marksObtained) as averageMarks'),
                DB::raw('COUNT(student_test_results.testId) as totalTests')
            )
            ->groupBy('students.studentId', 'students.studentNumber', 'users.userName')
            ->orderBy('averageMarks', 'desc')
            ->get();

        return response()->json([
            'class' => $testClass,
            'results' => $results,
            'classAverage' => round($results->avg('averageMarks'), 2),
        ]);
    }

    public function studentComprehensiveReport($studentId)
    {
        $student = Student::with('user')->findOrFail($studentId);

        // Test results
        $testResults = DB::table('student_test_results')
            ->join('tests', 'student_test_results.testId', '=', 'tests.testId')
            ->join('subjects', 'tests.subjectId', '=', 'subjects.subjectId')
            ->where('student_test_results.studentId', $studentId)
            ->select(
                'subjects.subjectName',
                'tests.testDate',
                'student_test_results.marksObtained',
                'student_test_results.grade',
                'student_test_results.remarks'
            )
            ->orderBy('tests.testDate', 'desc')
            ->get();

        // Attendance
        $attendance = DB::table('attendance')
            ->join('subjects', 'attendance.subjectId', '=', 'subjects.subjectId')
            ->where('attendance.studentId', $studentId)
            ->select(
                'subjects.subjectName',
                DB::raw('COUNT(*) as total'),
                DB::raw('SUM(CASE WHEN status = "Present" THEN 1 ELSE 0 END) as present'),
                DB::raw('SUM(CASE WHEN status = "Absent" THEN 1 ELSE 0 END) as absent'),
                DB::raw('ROUND((SUM(CASE WHEN status = "Present" THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as percentage')
            )
            ->groupBy('subjects.subjectId', 'subjects.subjectName')
            ->get();

        // Performance summary
        $summary = [
            'totalTests' => $testResults->count(),
            'averageMarks' => round($testResults->avg('marksObtained'), 2),
            'highestMark' => $testResults->max('marksObtained'),
            'lowestMark' => $testResults->min('marksObtained'),
            'overallAttendance' => round($attendance->avg('percentage'), 2),
        ];

        return response()->json([
            'student' => $student,
            'testResults' => $testResults,
            'attendance' => $attendance,
            'summary' => $summary,
        ]);
    }
}

