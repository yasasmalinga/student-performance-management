# Student Performance Monitoring System - Laravel Backend

## Overview

This is the Laravel backend API for the Student Performance Monitoring System, an enterprise-level software solution designed to provide a holistic and real-time overview of student academic performance.

## Features

- **User Management**: Admin, Teacher, Student, and Parent user types with role-based access control
- **Subject Management**: Academic and non-academic subjects
- **Test Management**: Exams and non-academic events
- **Attendance Tracking**: Comprehensive attendance management
- **Performance Reports**: Detailed performance analytics and reports
- **Notifications**: Real-time notifications for students and parents
- **RESTful API**: Clean and well-documented API endpoints
- **Authentication**: Laravel Sanctum for API token authentication

## Tech Stack

- **Framework**: Laravel 10.x
- **PHP**: 8.1+
- **Database**: MySQL 8.0+
- **Authentication**: Laravel Sanctum
- **ORM**: Eloquent

## Installation

### Prerequisites

- PHP >= 8.1
- Composer
- MySQL 8.0+
- Node.js & NPM (optional, for frontend integration)

### Setup Steps

1. **Install Dependencies**
   ```bash
   cd backend
   composer install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your database credentials:
   ```
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=student_performance_db
   DB_USERNAME=root
   DB_PASSWORD=your_password
   ```

3. **Generate Application Key**
   ```bash
   php artisan key:generate
   ```

4. **Run Migrations**
   ```bash
   php artisan migrate
   ```

5. **Seed Database (Optional)**
   ```bash
   php artisan db:seed
   ```
   
   This will create sample data including:
   - 1 Admin user
   - 3 Teachers
   - 5 Students
   - 2 Parents
   - 10 Subjects
   - Sample test results and attendance records

6. **Start the Server**
   ```bash
   php artisan serve
   ```
   
   The API will be available at `http://localhost:8000`

## Default Login Credentials

After seeding the database, you can use these credentials:

### Admin
- **Email**: admin@school.com
- **Username**: admin
- **Password**: admin123

### Teacher
- **Email**: john.teacher@school.com
- **Username**: john_teacher
- **Password**: teacher123

### Student
- **Email**: jane.student@school.com
- **Username**: jane_student
- **Password**: student123

### Parent
- **Email**: bob.parent@school.com
- **Username**: bob_parent
- **Password**: parent123

## API Documentation

### Authentication

#### Login
```http
POST /api/login
Content-Type: application/json

{
  "userName": "admin",
  "password": "admin123"
}
```

Response:
```json
{
  "user": {
    "userId": 1,
    "userName": "admin",
    "userType": 1,
    "userEmail": "admin@school.com",
    "admin": {
      "adminId": 1,
      "adminLevel": 1
    }
  },
  "token": "1|abc123..."
}
```

#### Logout
```http
POST /api/logout
Authorization: Bearer {token}
```

### API Endpoints

#### Users
- `GET /api/users` - List all users (Admin, Teacher only)
- `GET /api/users/{id}` - Get user details
- `POST /api/users` - Create new user (Admin only)
- `PUT /api/users/{id}` - Update user (Admin only)
- `DELETE /api/users/{id}` - Delete user (Admin only)
- `GET /api/users/search?q={query}` - Search users

#### Subjects
- `GET /api/subjects` - List all subjects
- `GET /api/subjects/{id}` - Get subject details
- `POST /api/subjects` - Create subject (Admin only)
- `PUT /api/subjects/{id}` - Update subject (Admin only)
- `DELETE /api/subjects/{id}` - Delete subject (Admin only)
- `POST /api/subjects/{id}/assign-teacher` - Assign teacher to subject
- `POST /api/subjects/{id}/remove-teacher` - Remove teacher from subject

#### Tests
- `GET /api/tests` - List all tests
- `GET /api/tests/{id}` - Get test details
- `POST /api/tests` - Create test (Admin, Teacher)
- `PUT /api/tests/{id}` - Update test (Admin, Teacher)
- `DELETE /api/tests/{id}` - Delete test (Admin, Teacher)
- `POST /api/tests/{id}/add-result` - Add student result

#### Students
- `GET /api/students` - List all students
- `GET /api/students/{id}` - Get student details
- `GET /api/students/{id}/performance` - Get student performance
- `GET /api/students/{id}/report` - Get comprehensive report
- `POST /api/students/{id}/test-results` - Add test result
- `PUT /api/students/{studentId}/test-results/{resultId}` - Update result
- `DELETE /api/students/{studentId}/test-results/{resultId}` - Delete result

#### Teachers
- `GET /api/teachers` - List all teachers
- `GET /api/teachers/{id}` - Get teacher details
- `GET /api/teachers/{id}/subjects` - Get teacher subjects
- `GET /api/teachers/{id}/tests` - Get teacher tests

#### Attendance
- `GET /api/attendance` - List attendance records
- `GET /api/attendance/{id}` - Get attendance details
- `POST /api/attendance` - Create attendance (Admin, Teacher)
- `POST /api/attendance/bulk` - Bulk create attendance
- `PUT /api/attendance/{id}` - Update attendance (Admin, Teacher)
- `DELETE /api/attendance/{id}` - Delete attendance (Admin, Teacher)
- `GET /api/attendance/statistics/{studentId}` - Get attendance stats

#### Notifications
- `GET /api/notifications` - List notifications
- `GET /api/notifications/{id}` - Get notification details
- `POST /api/notifications` - Create notification (Admin, Teacher)
- `PUT /api/notifications/{id}/read` - Mark as read
- `POST /api/notifications/mark-all-read` - Mark all as read
- `GET /api/notifications/unread-count/{studentId}` - Get unread count

#### Reports
- `GET /api/reports/overall-performance` - Overall performance report
- `GET /api/reports/subject-performance/{subjectId}` - Subject performance
- `GET /api/reports/attendance` - Attendance report
- `GET /api/reports/class/{testClass}` - Class report
- `GET /api/reports/student/{studentId}/comprehensive` - Comprehensive student report

## Database Schema

The system uses the following main tables:

- **users**: Base table for all users
- **admins**: Admin-specific data
- **teachers**: Teacher-specific data
- **students**: Student-specific data
- **parents**: Parent-specific data
- **subjects**: Academic and non-academic subjects
- **tests**: Base table for all tests/exams
- **exams**: Exam-specific data
- **non_academic**: Non-academic event data
- **student_test_results**: Student marks and grades
- **attendance**: Daily attendance records
- **notifications**: System notifications
- **teacher_subjects**: Teacher-subject assignments

## User Types

1. **Admin (userType = 1)**: Full system access
2. **Teacher (userType = 2)**: Manage tests, attendance, and view reports
3. **Student (userType = 3)**: View own performance and attendance
4. **Parent (userType = 4)**: View child's performance

## Security

- All routes except `/api/login` require authentication
- Role-based access control using custom middleware
- Laravel Sanctum for API token authentication
- CORS configured for Angular frontend integration

## Frontend Integration

The backend is designed to work with an Angular frontend. Update the CORS settings in `config/cors.php` to match your frontend URL:

```php
'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:4200')],
```

## Development

### Running Tests
```bash
php artisan test
```

### Code Style
```bash
./vendor/bin/pint
```

### Database Reset
```bash
php artisan migrate:fresh --seed
```

## Production Deployment

1. Set `APP_ENV=production` in `.env`
2. Set `APP_DEBUG=false` in `.env`
3. Configure proper database credentials
4. Use proper password hashing (Hash::make()) for user creation
5. Set up proper CORS policies
6. Enable caching:
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

## Support

For issues and questions, please contact the development team or create an issue in the repository.

## License

MIT License

