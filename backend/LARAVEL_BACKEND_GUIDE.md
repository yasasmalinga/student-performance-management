# Laravel Backend Integration Guide

## Overview

This document provides guidance on integrating the Laravel backend with your Angular frontend and understanding the architecture.

## Project Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/     # API Controllers
│   │   │   ├── AuthController.php
│   │   │   ├── UserController.php
│   │   │   ├── StudentController.php
│   │   │   ├── TeacherController.php
│   │   │   ├── SubjectController.php
│   │   │   ├── TestController.php
│   │   │   ├── AttendanceController.php
│   │   │   ├── NotificationController.php
│   │   │   └── ReportController.php
│   │   ├── Middleware/      # Custom middleware
│   │   │   └── CheckUserType.php
│   │   └── Kernel.php       # HTTP Kernel
│   └── Models/              # Eloquent Models
│       ├── User.php
│       ├── Admin.php
│       ├── Teacher.php
│       ├── Student.php
│       ├── ParentModel.php
│       ├── Subject.php
│       ├── Test.php
│       ├── Exam.php
│       ├── NonAcademic.php
│       ├── StudentTestResult.php
│       ├── Attendance.php
│       ├── Notification.php
│       └── TeacherSubject.php
├── config/                  # Configuration files
│   ├── database.php
│   ├── cors.php
│   ├── sanctum.php
│   ├── auth.php
│   └── app.php
├── database/
│   ├── migrations/          # Database migrations
│   └── seeders/             # Database seeders
├── routes/
│   ├── api.php             # API routes
│   ├── web.php             # Web routes
│   └── console.php         # Console routes
└── public/
    └── index.php           # Entry point
```

## Key Features

### 1. Authentication with Laravel Sanctum

Laravel Sanctum provides token-based authentication for SPAs.

**Login Flow:**
1. Frontend sends credentials to `/api/login`
2. Backend validates and returns token
3. Frontend stores token and includes in subsequent requests

**Example (Angular Service):**
```typescript
login(userName: string, password: string) {
  return this.http.post('http://localhost:8000/api/login', {
    userName,
    password
  }).pipe(
    tap((response: any) => {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    })
  );
}
```

**Including Token in Requests:**
```typescript
const token = localStorage.getItem('token');
const headers = new HttpHeaders({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
});

this.http.get('http://localhost:8000/api/students', { headers });
```

### 2. Role-Based Access Control

The system uses middleware to restrict endpoints based on user type:

```php
// Admin only
Route::post('/users', [UserController::class, 'store'])
    ->middleware('check.usertype:1');

// Admin and Teacher
Route::get('/reports/overall-performance', [ReportController::class, 'overallPerformance'])
    ->middleware('check.usertype:1,2');
```

**User Types:**
- 1: Admin - Full access
- 2: Teacher - Manage classes, tests, attendance
- 3: Student - View own data
- 4: Parent - View child's data

### 3. Model Relationships

The Laravel models use Eloquent relationships:

```php
// User model
public function student() {
    return $this->hasOne(Student::class, 'userId', 'userId');
}

// Student model
public function testResults() {
    return $this->hasMany(StudentTestResult::class, 'studentId', 'studentId');
}

// Test model
public function students() {
    return $this->belongsToMany(Student::class, 'student_test_results')
        ->withPivot('marksObtained', 'grade', 'remarks');
}
```

This allows efficient data loading:
```php
$student = Student::with(['user', 'testResults', 'attendance'])->find($id);
```

### 4. API Response Structure

**Success Response:**
```json
{
  "data": [...],
  "message": "Success"
}
```

**Paginated Response:**
```json
{
  "current_page": 1,
  "data": [...],
  "per_page": 15,
  "total": 50
}
```

**Error Response:**
```json
{
  "message": "Validation failed",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

## Angular Integration

### 1. Environment Configuration

**environment.ts:**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

### 2. HTTP Interceptor for Authentication

Create an interceptor to automatically add the auth token:

**auth.interceptor.ts:**
```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const token = localStorage.getItem('token');
    
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    return next.handle(req);
  }
}
```

### 3. Service Example

**student.service.ts:**
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private apiUrl = `${environment.apiUrl}/students`;

  constructor(private http: HttpClient) {}

  getStudents() {
    return this.http.get(this.apiUrl);
  }

  getStudent(id: number) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getPerformance(id: number) {
    return this.http.get(`${this.apiUrl}/${id}/performance`);
  }

  getReport(id: number) {
    return this.http.get(`${this.apiUrl}/${id}/report`);
  }
}
```

### 4. Handling Errors

**error.interceptor.ts:**
```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Unauthorized - redirect to login
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        } else if (error.status === 403) {
          // Forbidden - insufficient permissions
          alert('You do not have permission to perform this action');
        }
        return throwError(() => error);
      })
    );
  }
}
```

## Common Operations

### 1. User Login
```typescript
this.authService.login(userName, password).subscribe({
  next: (response) => {
    console.log('Login successful', response.user);
    this.router.navigate(['/dashboard']);
  },
  error: (error) => {
    console.error('Login failed', error);
  }
});
```

### 2. Fetching Students
```typescript
this.studentService.getStudents().subscribe({
  next: (response: any) => {
    this.students = response.data;
  }
});
```

### 3. Creating Attendance
```typescript
const attendanceData = {
  studentId: 1,
  subjectId: 1,
  attendanceDate: '2024-01-20',
  status: 'Present',
  teacherId: this.currentUser.userId
};

this.attendanceService.create(attendanceData).subscribe({
  next: () => {
    console.log('Attendance recorded');
  }
});
```

### 4. Adding Test Results
```typescript
const resultData = {
  studentId: 1,
  marksObtained: 85,
  grade: 'A',
  remarks: 'Excellent performance'
};

this.testService.addResult(testId, resultData).subscribe({
  next: () => {
    console.log('Result added');
  }
});
```

## Database Schema Relationships

```
users (1) ─── (1) admins
      (1) ─── (1) teachers ─── (M) teacher_subjects ─── (M) subjects
      (1) ─── (1) students ─── (M) student_test_results ─── (M) tests
      (1) ─── (1) parents          └── (M) attendance
                                                   
subjects ─── (M) tests ─── (1) exams
                    └── (1) non_academic
```

## Performance Tips

1. **Use Eager Loading:** Load relationships efficiently
   ```php
   $student = Student::with(['user', 'testResults.test', 'attendance'])->find($id);
   ```

2. **Paginate Large Results:**
   ```php
   $students = Student::paginate(15);
   ```

3. **Cache Frequently Accessed Data:**
   ```php
   $subjects = Cache::remember('subjects', 3600, function () {
       return Subject::all();
   });
   ```

4. **Use Indexes:** Already defined in migrations for common queries

5. **Optimize Queries:** Use select() to fetch only needed columns
   ```php
   $users = User::select('userId', 'userName', 'userEmail')->get();
   ```

## Security Best Practices

1. **Never expose sensitive data:** The User model hides password field
2. **Validate all inputs:** Controllers use validation rules
3. **Use HTTPS in production:** Update .env for production
4. **Rate limit API endpoints:** Configure in RouteServiceProvider
5. **Hash passwords properly:** Use `Hash::make()` for new users
6. **Sanitize user inputs:** Laravel does this automatically
7. **Keep dependencies updated:** Run `composer update` regularly

## Testing the API

### Using cURL

```bash
# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"userName":"admin","password":"admin123"}'

# Get students (with token)
curl -X GET http://localhost:8000/api/students \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman

1. Import the API endpoints
2. Set up environment variable for base URL
3. Add Bearer token to Authorization header
4. Test each endpoint

## Troubleshooting

### CORS Issues
- Check `config/cors.php` allowed origins
- Ensure frontend URL is in `SANCTUM_STATEFUL_DOMAINS`
- Clear config cache: `php artisan config:clear`

### Token Authentication Not Working
- Verify token is being sent in Authorization header
- Check Sanctum middleware is applied to api routes
- Ensure token hasn't expired

### 500 Server Errors
- Check `storage/logs/laravel.log`
- Enable debug mode: `APP_DEBUG=true` in .env
- Verify database connection

### Migration Errors
- Reset migrations: `php artisan migrate:fresh`
- Check database credentials in .env
- Ensure MySQL is running

## Next Steps

1. **Customize Controllers:** Add business logic as needed
2. **Add Validation Rules:** Create FormRequest classes
3. **Implement Notifications:** Use Laravel's notification system
4. **Add File Uploads:** For student documents
5. **Create Reports:** Generate PDF reports using packages
6. **Add Real-time Features:** Use Laravel Broadcasting
7. **Implement Caching:** For better performance
8. **Set up Queue Workers:** For background jobs
9. **Add Tests:** PHPUnit for unit and feature tests
10. **Deploy:** Configure for production environment

## Resources

- [Laravel Documentation](https://laravel.com/docs)
- [Laravel Sanctum](https://laravel.com/docs/sanctum)
- [Eloquent Relationships](https://laravel.com/docs/eloquent-relationships)
- [API Resources](https://laravel.com/docs/eloquent-resources)

