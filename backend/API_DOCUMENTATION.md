# API Documentation - Student Performance Monitoring System

## Base URL
```
http://localhost:8000/api
```

## Authentication

All endpoints except `/login` require authentication using Bearer tokens.

### Headers
```
Authorization: Bearer {your-token}
Content-Type: application/json
Accept: application/json
```

---

## Authentication Endpoints

### 1. Login
Authenticate user and receive access token.

**Endpoint:** `POST /api/login`

**Request Body:**
```json
{
  "userName": "admin",
  "password": "admin123"
}
```

**Success Response (200):**
```json
{
  "user": {
    "userId": 1,
    "userName": "admin",
    "userType": 1,
    "userEmail": "admin@school.com",
    "userContact": "1234567890",
    "createdAt": "2024-01-01T00:00:00.000000Z",
    "updatedAt": "2024-01-01T00:00:00.000000Z",
    "admin": {
      "adminId": 1,
      "userId": 1,
      "adminLevel": 1
    }
  },
  "token": "1|abcdef123456..."
}
```

**Error Response (422):**
```json
{
  "message": "The provided credentials are incorrect.",
  "errors": {
    "userName": ["The provided credentials are incorrect."]
  }
}
```

### 2. Logout
Revoke current access token.

**Endpoint:** `POST /api/logout`

**Headers:** Requires authentication

**Success Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

### 3. Get Current User
Get authenticated user details.

**Endpoint:** `GET /api/me`

**Headers:** Requires authentication

**Success Response (200):**
```json
{
  "userId": 1,
  "userName": "admin",
  "userType": 1,
  "userEmail": "admin@school.com",
  "admin": {
    "adminId": 1,
    "adminLevel": 1
  }
}
```

---

## User Management

### 1. List Users
Get paginated list of users.

**Endpoint:** `GET /api/users`

**Access:** Admin, Teacher

**Query Parameters:**
- `userType` (optional): Filter by user type (1-4)
- `search` (optional): Search by name or email
- `page` (optional): Page number

**Example:** `GET /api/users?userType=3&search=jane&page=1`

**Success Response (200):**
```json
{
  "current_page": 1,
  "data": [
    {
      "userId": 3,
      "userName": "jane_student",
      "userType": 3,
      "userEmail": "jane.student@school.com",
      "student": {
        "studentId": 1,
        "studentNumber": "S001"
      }
    }
  ],
  "per_page": 15,
  "total": 5
}
```

### 2. Get User by ID
Get specific user details.

**Endpoint:** `GET /api/users/{id}`

**Success Response (200):**
```json
{
  "userId": 3,
  "userName": "jane_student",
  "userType": 3,
  "userEmail": "jane.student@school.com",
  "userContact": "1234567896",
  "student": {
    "studentId": 1,
    "studentNumber": "S001",
    "dateOfBirth": "2010-05-15",
    "enrollmentDate": "2023-09-01"
  }
}
```

### 3. Create User
Create a new user with role-specific data.

**Endpoint:** `POST /api/users`

**Access:** Admin only

**Request Body (Student Example):**
```json
{
  "userName": "new_student",
  "password": "password123",
  "userType": 3,
  "userEmail": "new.student@school.com",
  "userContact": "1234567899",
  "studentNumber": "S006",
  "dateOfBirth": "2011-06-20",
  "enrollmentDate": "2024-01-15",
  "parentId": 4
}
```

**Request Body (Teacher Example):**
```json
{
  "userName": "new_teacher",
  "password": "password123",
  "userType": 2,
  "userEmail": "new.teacher@school.com",
  "userContact": "1234567898",
  "employeeNumber": "T004",
  "department": "Chemistry",
  "specialization": "Organic Chemistry"
}
```

**Success Response (201):**
```json
{
  "userId": 10,
  "userName": "new_student",
  "userType": 3,
  "userEmail": "new.student@school.com",
  "student": {
    "studentId": 6,
    "studentNumber": "S006"
  }
}
```

### 4. Update User
Update user information.

**Endpoint:** `PUT /api/users/{id}`

**Access:** Admin only

**Request Body:**
```json
{
  "userName": "updated_name",
  "userEmail": "updated@email.com",
  "userContact": "9876543210"
}
```

### 5. Delete User
Delete a user and associated role data.

**Endpoint:** `DELETE /api/users/{id}`

**Access:** Admin only

**Success Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

### 6. Search Users
Search users by name or email.

**Endpoint:** `GET /api/users/search?q={query}`

**Example:** `GET /api/users/search?q=jane`

**Success Response (200):**
```json
[
  {
    "userId": 3,
    "userName": "jane_student",
    "userEmail": "jane.student@school.com"
  }
]
```

---

## Subject Management

### 1. List Subjects
Get all subjects with assigned teachers.

**Endpoint:** `GET /api/subjects`

**Query Parameters:**
- `subjectType` (optional): Filter by type (1=Academic, 2=Non-Academic)

**Success Response (200):**
```json
[
  {
    "subjectId": 1,
    "subjectName": "Mathematics",
    "subjectType": 1,
    "description": "Core mathematics curriculum",
    "teachers": [
      {
        "teacherId": 1,
        "employeeNumber": "T001"
      }
    ]
  }
]
```

### 2. Create Subject
Create a new subject.

**Endpoint:** `POST /api/subjects`

**Access:** Admin only

**Request Body:**
```json
{
  "subjectName": "Computer Science",
  "subjectType": 1,
  "description": "Programming and computer fundamentals"
}
```

### 3. Assign Teacher to Subject
Assign a teacher to a subject.

**Endpoint:** `POST /api/subjects/{id}/assign-teacher`

**Access:** Admin only

**Request Body:**
```json
{
  "teacherId": 2
}
```

---

## Test Management

### 1. List Tests
Get paginated list of tests/exams.

**Endpoint:** `GET /api/tests`

**Query Parameters:**
- `testType` (optional): 1=Exam, 2=Non-Academic
- `subjectId` (optional): Filter by subject
- `teacherId` (optional): Filter by teacher

**Success Response (200):**
```json
{
  "data": [
    {
      "testId": 1,
      "testType": 1,
      "testMark": 100,
      "testDate": "2024-01-15",
      "subject": {
        "subjectName": "Mathematics"
      },
      "exam": {
        "testClass": 10,
        "testDescription": "Midterm Examination"
      }
    }
  ]
}
```

### 2. Create Test
Create a new test/exam.

**Endpoint:** `POST /api/tests`

**Access:** Admin, Teacher

**Request Body (Exam):**
```json
{
  "testType": 1,
  "testMark": 100,
  "testDate": "2024-02-20",
  "subjectId": 1,
  "teacherId": 2,
  "testClass": 10,
  "testDescription": "Final Examination"
}
```

**Request Body (Non-Academic):**
```json
{
  "testType": 2,
  "testDate": "2024-02-25",
  "subjectId": 8,
  "teacherId": 2,
  "eventType": 1,
  "eventDate": "2024-02-25",
  "eventDescription": "Annual Sports Day",
  "eventLevel": "School Level"
}
```

### 3. Add Student Result
Add or update student result for a test.

**Endpoint:** `POST /api/tests/{testId}/add-result`

**Access:** Admin, Teacher

**Request Body:**
```json
{
  "studentId": 1,
  "marksObtained": 85,
  "grade": "A",
  "remarks": "Excellent performance"
}
```

---

## Student Management

### 1. List Students
Get paginated list of students.

**Endpoint:** `GET /api/students`

**Query Parameters:**
- `search` (optional): Search by name, email, or student number

**Success Response (200):**
```json
{
  "data": [
    {
      "studentId": 1,
      "studentNumber": "S001",
      "user": {
        "userName": "jane_student",
        "userEmail": "jane.student@school.com"
      }
    }
  ]
}
```

### 2. Get Student Performance
Get student academic performance summary.

**Endpoint:** `GET /api/students/{id}/performance`

**Success Response (200):**
```json
{
  "student": {
    "studentId": 1,
    "studentNumber": "S001"
  },
  "averageMarks": 82.5,
  "totalTests": 15,
  "subjectPerformance": [
    {
      "subject": "Mathematics",
      "averageMarks": 85.67,
      "totalTests": 3
    }
  ],
  "recentResults": []
}
```

### 3. Get Student Report
Get comprehensive student report.

**Endpoint:** `GET /api/students/{id}/report`

**Success Response (200):**
```json
{
  "student": {},
  "testResults": [],
  "attendance": [],
  "summary": {
    "totalTests": 15,
    "averageMarks": 82.5,
    "highestMark": 95,
    "lowestMark": 65
  }
}
```

---

## Attendance Management

### 1. List Attendance
Get attendance records.

**Endpoint:** `GET /api/attendance`

**Query Parameters:**
- `studentId` (optional)
- `subjectId` (optional)
- `teacherId` (optional)
- `date_from` (optional): YYYY-MM-DD
- `date_to` (optional): YYYY-MM-DD

**Success Response (200):**
```json
{
  "data": [
    {
      "attendanceId": 1,
      "attendanceDate": "2024-01-15",
      "status": "Present",
      "student": {
        "studentNumber": "S001"
      },
      "subject": {
        "subjectName": "Mathematics"
      }
    }
  ]
}
```

### 2. Create Attendance
Record attendance for a student.

**Endpoint:** `POST /api/attendance`

**Access:** Admin, Teacher

**Request Body:**
```json
{
  "studentId": 1,
  "subjectId": 1,
  "attendanceDate": "2024-01-20",
  "status": "Present",
  "remarks": "",
  "teacherId": 2
}
```

### 3. Bulk Create Attendance
Create multiple attendance records at once.

**Endpoint:** `POST /api/attendance/bulk`

**Access:** Admin, Teacher

**Request Body:**
```json
{
  "attendance": [
    {
      "studentId": 1,
      "subjectId": 1,
      "attendanceDate": "2024-01-20",
      "status": "Present",
      "teacherId": 2
    },
    {
      "studentId": 2,
      "subjectId": 1,
      "attendanceDate": "2024-01-20",
      "status": "Absent",
      "remarks": "Sick",
      "teacherId": 2
    }
  ]
}
```

### 4. Get Attendance Statistics
Get attendance statistics for a student.

**Endpoint:** `GET /api/attendance/statistics/{studentId}`

**Query Parameters:**
- `subjectId` (optional): Filter by subject

**Success Response (200):**
```json
{
  "total": 100,
  "present": 85,
  "absent": 10,
  "late": 3,
  "excused": 2,
  "percentage": 85.0
}
```

---

## Notification Management

### 1. List Notifications
Get notifications.

**Endpoint:** `GET /api/notifications`

**Query Parameters:**
- `studentId` (optional)
- `isRead` (optional): true/false
- `notificationType` (optional): 1=Academic, 2=Non-Academic, 3=General

**Success Response (200):**
```json
{
  "data": [
    {
      "notificationId": 1,
      "title": "Upcoming Exam",
      "message": "You have an exam next week",
      "notificationType": 1,
      "isRead": false,
      "createdAt": "2024-01-15T10:00:00.000000Z"
    }
  ]
}
```

### 2. Create Notification
Send a new notification.

**Endpoint:** `POST /api/notifications`

**Access:** Admin, Teacher

**Request Body:**
```json
{
  "studentId": 1,
  "subjectId": 1,
  "title": "Test Results Available",
  "message": "Your test results have been published",
  "notificationType": 1
}
```

### 3. Mark as Read
Mark notification as read.

**Endpoint:** `PUT /api/notifications/{id}/read`

### 4. Get Unread Count
Get count of unread notifications for a student.

**Endpoint:** `GET /api/notifications/unread-count/{studentId}`

**Success Response (200):**
```json
{
  "count": 5
}
```

---

## Report Endpoints

### 1. Overall Performance
Get overall student performance across the system.

**Endpoint:** `GET /api/reports/overall-performance`

**Access:** Admin, Teacher

**Query Parameters:**
- `minAverage` (optional): Filter students by minimum average

**Success Response (200):**
```json
[
  {
    "studentId": 1,
    "studentNumber": "S001",
    "userName": "jane_student",
    "averageMarks": 85.5,
    "totalTests": 15
  }
]
```

### 2. Subject Performance
Get performance for a specific subject.

**Endpoint:** `GET /api/reports/subject-performance/{subjectId}`

**Access:** Admin, Teacher

**Success Response (200):**
```json
{
  "subject": {
    "subjectName": "Mathematics"
  },
  "results": [
    {
      "studentId": 1,
      "studentNumber": "S001",
      "userName": "jane_student",
      "averageMarks": 88.33,
      "totalTests": 3,
      "highestMark": 95,
      "lowestMark": 80
    }
  ]
}
```

### 3. Comprehensive Student Report
Get detailed report for a student.

**Endpoint:** `GET /api/reports/student/{studentId}/comprehensive`

**Success Response (200):**
```json
{
  "student": {},
  "testResults": [],
  "attendance": [],
  "summary": {
    "totalTests": 15,
    "averageMarks": 82.5,
    "highestMark": 95,
    "lowestMark": 65,
    "overallAttendance": 87.5
  }
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "message": "Unauthenticated."
}
```

### 403 Forbidden
```json
{
  "error": "Unauthorized. Insufficient permissions."
}
```

### 404 Not Found
```json
{
  "message": "Record not found."
}
```

### 422 Validation Error
```json
{
  "message": "The given data was invalid.",
  "errors": {
    "userEmail": [
      "The user email has already been taken."
    ]
  }
}
```

### 500 Server Error
```json
{
  "error": "Failed to create user: [error details]"
}
```

---

## User Types Reference

| Type | Value | Description |
|------|-------|-------------|
| Admin | 1 | Full system access |
| Teacher | 2 | Manage classes and grades |
| Student | 3 | View own data |
| Parent | 4 | View child's data |

## Status Codes

- `200 OK`: Success
- `201 Created`: Resource created
- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: Not authorized
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
- `500 Internal Server Error`: Server error

