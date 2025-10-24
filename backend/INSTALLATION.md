# Installation Guide - Student Performance Monitoring System Backend

## System Requirements

- **PHP**: 8.1 or higher
- **Composer**: Latest version
- **MySQL**: 8.0 or higher
- **Web Server**: Apache or Nginx (optional for development)
- **Memory**: Minimum 512MB RAM
- **Disk Space**: Minimum 500MB

## Step-by-Step Installation

### 1. Prerequisites Check

Verify you have the required PHP version and extensions:

```bash
php -v
php -m
```

Required PHP extensions:
- OpenSSL
- PDO
- Mbstring
- Tokenizer
- XML
- Ctype
- JSON
- BCMath

### 2. Download/Clone the Project

```bash
cd backend
```

### 3. Install PHP Dependencies

```bash
composer install
```

If you encounter any errors, try:
```bash
composer install --no-scripts
composer dump-autoload
```

### 4. Environment Configuration

Create your environment file:
```bash
cp .env.example .env
```

Edit `.env` and configure the following:

#### Application Settings
```env
APP_NAME="Student Performance Monitoring System"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
```

#### Database Configuration
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=student_performance_db
DB_USERNAME=root
DB_PASSWORD=your_mysql_password
```

#### Frontend URL (for CORS)
```env
FRONTEND_URL=http://localhost:4200
```

### 5. Generate Application Key

```bash
php artisan key:generate
```

This will set the `APP_KEY` in your `.env` file.

### 6. Create Database

Create a MySQL database:

**Option 1: Using MySQL Command Line**
```sql
mysql -u root -p
CREATE DATABASE student_performance_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

**Option 2: Using phpMyAdmin**
- Open phpMyAdmin
- Click "New" to create a new database
- Name: `student_performance_db`
- Collation: `utf8mb4_unicode_ci`
- Click "Create"

### 7. Run Database Migrations

```bash
php artisan migrate
```

This will create all the required tables in your database.

### 8. Seed Sample Data (Optional but Recommended)

```bash
php artisan db:seed
```

This creates:
- 1 Admin user
- 3 Teachers
- 5 Students  
- 2 Parents
- 10 Subjects (Math, Science, English, etc.)
- Sample tests and exams
- Attendance records (last 30 days)
- Notifications

### 9. Start the Development Server

```bash
php artisan serve
```

The API will be available at: `http://localhost:8000`

To use a different port:
```bash
php artisan serve --port=8080
```

### 10. Verify Installation

Test the API by accessing:
```
http://localhost:8000/api
```

You should see a 404 error with JSON response (this is normal).

Test the login endpoint:
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"userName":"admin","password":"admin123"}'
```

## Default User Credentials

### Administrator
- Username: `admin`
- Password: `admin123`
- Email: `admin@school.com`

### Teacher
- Username: `john_teacher`
- Password: `teacher123`
- Email: `john.teacher@school.com`

### Student
- Username: `jane_student`
- Password: `student123`
- Email: `jane.student@school.com`

### Parent
- Username: `bob_parent`
- Password: `parent123`
- Email: `bob.parent@school.com`

## Troubleshooting

### Issue: "Class not found" errors

**Solution:**
```bash
composer dump-autoload
```

### Issue: Database connection errors

**Solution:**
1. Verify MySQL is running
2. Check database credentials in `.env`
3. Ensure database exists
4. Test connection:
   ```bash
   php artisan migrate:status
   ```

### Issue: Permission errors

**Solution:**
```bash
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

On Windows (in PowerShell as Administrator):
```powershell
icacls storage /grant Users:F /T
icacls bootstrap/cache /grant Users:F /T
```

### Issue: Port already in use

**Solution:**
```bash
php artisan serve --port=8001
```

### Issue: CORS errors when connecting to frontend

**Solution:**
1. Update `FRONTEND_URL` in `.env`
2. Clear config cache:
   ```bash
   php artisan config:clear
   php artisan cache:clear
   ```

### Issue: Migration errors

**Solution:**
```bash
# Reset and re-run migrations
php artisan migrate:fresh

# With seeding
php artisan migrate:fresh --seed
```

## Post-Installation Steps

### 1. Configure CORS for Production

Edit `config/cors.php` and update allowed origins:
```php
'allowed_origins' => [
    'https://your-frontend-domain.com',
],
```

### 2. Optimize for Production

When deploying to production:

```bash
# Set environment to production
APP_ENV=production
APP_DEBUG=false

# Optimize configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Optimize autoloader
composer install --optimize-autoloader --no-dev
```

### 3. Set Up Task Scheduler (Optional)

Add to crontab:
```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

### 4. Configure Queue Workers (Optional)

For background jobs:
```bash
php artisan queue:work
```

## Updating the Application

```bash
# Pull latest changes
git pull origin main

# Update dependencies
composer install

# Run new migrations
php artisan migrate

# Clear cache
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

## Backup and Restore

### Backup Database
```bash
mysqldump -u root -p student_performance_db > backup.sql
```

### Restore Database
```bash
mysql -u root -p student_performance_db < backup.sql
```

## Next Steps

1. **Test the API**: Use Postman or curl to test endpoints
2. **Connect Frontend**: Configure your Angular app to use this API
3. **Customize**: Modify models, controllers as needed
4. **Add Features**: Extend functionality based on requirements

## Need Help?

- Check the main README.md for API documentation
- Review Laravel documentation: https://laravel.com/docs
- Check logs in `storage/logs/laravel.log`

## Security Notes

⚠️ **Important for Production:**
- Change all default passwords
- Use `Hash::make()` for password hashing
- Set `APP_DEBUG=false`
- Use HTTPS
- Keep dependencies updated
- Implement rate limiting
- Use strong database passwords
- Restrict database access

