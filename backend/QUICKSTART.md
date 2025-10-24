# Quick Start Guide - 5 Minutes to Running

Get the Laravel backend up and running in 5 minutes!

## Prerequisites

✅ PHP 8.1+ installed  
✅ Composer installed  
✅ MySQL 8.0+ installed and running

## Quick Setup

### 1. Install Dependencies (1 min)
```bash
cd backend
composer install
```

### 2. Configure Environment (30 sec)
```bash
# Copy environment file (already exists, just edit if needed)
# Update database credentials in .env file
# DB_DATABASE=student_performance_db
# DB_USERNAME=root
# DB_PASSWORD=your_password
```

### 3. Generate Application Key (10 sec)
```bash
php artisan key:generate
```

### 4. Create Database (30 sec)
```bash
# In MySQL command line:
mysql -u root -p
CREATE DATABASE student_performance_db;
EXIT;
```

### 5. Run Migrations & Seed Data (1 min)
```bash
php artisan migrate --seed
```

### 6. Start Server (10 sec)
```bash
php artisan serve
```

## Test It! (2 min)

### Test 1: Check Server
Open browser: `http://localhost:8000`

You should see:
```json
{
  "message": "Student Performance Monitoring System API",
  "version": "1.0.0"
}
```

### Test 2: Login
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"userName":"admin","password":"admin123"}'
```

You should get a token!

### Test 3: Get Students
Copy the token from Test 2, then:
```bash
curl -X GET http://localhost:8000/api/students \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Default Login Credentials

| Role | Username | Password | Email |
|------|----------|----------|-------|
| Admin | admin | admin123 | admin@school.com |
| Teacher | john_teacher | teacher123 | john.teacher@school.com |
| Student | jane_student | student123 | jane.student@school.com |
| Parent | bob_parent | parent123 | bob.parent@school.com |

## What's Included?

After seeding, your database has:
- ✅ 1 Admin
- ✅ 3 Teachers  
- ✅ 5 Students
- ✅ 2 Parents
- ✅ 10 Subjects (Math, Science, English, Sports, Music, etc.)
- ✅ 15+ Tests/Exams with results
- ✅ 30 days of attendance records
- ✅ Sample notifications

## Next Steps

1. **Read API Documentation**: See `API_DOCUMENTATION.md`
2. **Connect Your Frontend**: See `LARAVEL_BACKEND_GUIDE.md`
3. **Customize**: Modify controllers and models as needed

## Quick API Reference

### Authentication
```bash
# Login
POST /api/login
Body: {"userName": "admin", "password": "admin123"}

# Logout
POST /api/logout
Header: Authorization: Bearer {token}
```

### Key Endpoints
```bash
GET  /api/students          # List students
GET  /api/students/{id}     # Student details
GET  /api/teachers          # List teachers
GET  /api/subjects          # List subjects
GET  /api/tests             # List tests
GET  /api/attendance        # Attendance records
GET  /api/notifications     # Notifications
```

### Reports
```bash
GET  /api/students/{id}/performance                 # Student performance
GET  /api/students/{id}/report                      # Comprehensive report
GET  /api/reports/overall-performance               # All students
GET  /api/reports/subject-performance/{subjectId}   # Subject report
GET  /api/attendance/statistics/{studentId}         # Attendance stats
```

## Troubleshooting

### Can't connect to database?
- Check MySQL is running
- Verify credentials in `.env`
- Ensure database exists

### Port 8000 already in use?
```bash
php artisan serve --port=8080
```

### Migrations failed?
```bash
php artisan migrate:fresh --seed
```

### Need to reset everything?
```bash
php artisan migrate:fresh --seed
php artisan cache:clear
php artisan config:clear
```

## Getting Help

- 📖 Full docs: `README.md`
- 🔧 Installation: `INSTALLATION.md`  
- 📡 API docs: `API_DOCUMENTATION.md`
- 🎯 Integration: `LARAVEL_BACKEND_GUIDE.md`

---

**That's it! You're ready to go! 🚀**

