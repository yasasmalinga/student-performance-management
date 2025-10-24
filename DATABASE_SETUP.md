# Student Performance Management System - Database Setup

## Prerequisites
- MySQL Server installed and running
- Node.js and npm installed
- Angular CLI installed

## Database Setup Instructions

### 1. Install MySQL
If you don't have MySQL installed:
- Download MySQL from: https://dev.mysql.com/downloads/mysql/
- Install and start MySQL service
- Note your MySQL root password

### 2. Create Database
1. Open MySQL command line or MySQL Workbench
2. Run the SQL script located at: `database/schema.sql`
3. This will create the `student_performance_db` database with all required tables

### 3. Configure Database Connection
1. Open `src/app/config/database.config.ts`
2. Update the configuration with your MySQL credentials:
```typescript
export const databaseConfig: DatabaseConfig = {
  host: 'localhost',
  user: 'root',
  password: 'your_mysql_password', // Update this
  database: 'student_performance_db',
  port: 3306,
  connectionLimit: 10
};
```

### 4. Test Database Connection
The application includes a database connection test. You can test it by:
1. Starting the Angular application: `ng serve`
2. The database service will automatically test the connection on startup

## Database Schema Overview

### Core Tables
- **users**: Base table for all user types (Admin, Teacher, Student, Parent)
- **subjects**: Academic and non-academic subjects
- **tests**: Base table for exams and non-academic events
- **exams**: Specific exam information (inherits from tests)
- **non_academic**: Non-academic events (inherits from tests)

### User-Specific Tables
- **admins**: Admin-specific information
- **teachers**: Teacher-specific information
- **students**: Student-specific information
- **parents**: Parent-specific information

### Relationship Tables
- **student_test_results**: Many-to-many relationship between students and tests
- **attendance**: Student attendance records
- **notifications**: System notifications
- **teacher_subjects**: Teacher-subject assignments

## Sample Data
The schema includes sample data for testing:
- 1 Admin user (admin/admin123)
- 1 Teacher user (john_teacher/teacher123)
- 1 Student user (jane_student/student123)
- 1 Parent user (bob_parent/parent123)
- 5 Sample subjects (Mathematics, English, Science, Sports, Music)

## Usage Examples

### Login
```typescript
const user = await this.userService.login('admin', 'admin123');
```

### Add Test Marks
```typescript
const testData = {
  studentId: 1,
  testId: 1,
  marksObtained: 85,
  grade: 'A',
  remarks: 'Good performance'
};
await this.userService.addTestMarks(testData);
```

### View Student Performance
```typescript
const performance = await this.testService.getStudentPerformance(1);
```

## Troubleshooting

### Connection Issues
1. Ensure MySQL service is running
2. Check firewall settings
3. Verify credentials in database.config.ts
4. Check if the database exists

### Permission Issues
1. Ensure the MySQL user has proper permissions
2. Grant necessary privileges:
```sql
GRANT ALL PRIVILEGES ON student_performance_db.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

## Security Notes
- Change default passwords in production
- Use environment variables for database credentials
- Implement proper authentication and authorization
- Use prepared statements (already implemented) to prevent SQL injection
