<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $query = Notification::query();

        if ($request->has('studentId')) {
            $query->where('studentId', $request->studentId);
        }

        if ($request->has('isRead')) {
            $query->where('isRead', $request->isRead);
        }

        if ($request->has('notificationType')) {
            $query->where('notificationType', $request->notificationType);
        }

        $notifications = $query->with(['subject', 'student.user'])
            ->orderBy('createdAt', 'desc')
            ->paginate(20);

        return response()->json($notifications);
    }

    public function show($id)
    {
        $notification = Notification::with(['subject', 'student.user'])
            ->findOrFail($id);
        
        return response()->json($notification);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'subjectId' => 'nullable|exists:subjects,subjectId',
            'studentId' => 'nullable|exists:students,studentId',
            'title' => 'required|string|max:200',
            'message' => 'required|string',
            'notificationType' => 'required|integer|in:1,2,3',
        ]);

        $notification = Notification::create($validated);

        return response()->json($notification, 201);
    }

    public function markAsRead($id)
    {
        $notification = Notification::findOrFail($id);
        $notification->update(['isRead' => true]);

        return response()->json($notification);
    }

    public function markAllAsRead(Request $request)
    {
        $studentId = $request->input('studentId');
        
        Notification::where('studentId', $studentId)
            ->where('isRead', false)
            ->update(['isRead' => true]);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    public function destroy($id)
    {
        $notification = Notification::findOrFail($id);
        $notification->delete();

        return response()->json(['message' => 'Notification deleted successfully']);
    }

    public function unreadCount(Request $request, $studentId)
    {
        $count = Notification::where('studentId', $studentId)
            ->where('isRead', false)
            ->count();

        return response()->json(['count' => $count]);
    }
}

