# Frontend Integration Guide for Angular

This guide shows how to connect your Angular frontend to the Laravel backend.

## Step 1: Update Angular Environment

**src/environments/environment.ts:**
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

**src/environments/environment.prod.ts:**
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api'
};
```

## Step 2: Replace Database Service

Your current Angular app uses `mysql2` directly. Replace it with HTTP calls to Laravel backend.

### Old Approach (Remove this):
```typescript
// DON'T USE - This was for direct MySQL access
import mysql from 'mysql2/promise';
const connection = await mysql.createConnection({...});
```

### New Approach (Use HTTP):
```typescript
// Use Angular HttpClient instead
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

constructor(private http: HttpClient) {}

getStudents() {
  return this.http.get(`${environment.apiUrl}/students`);
}
```

## Step 3: Create Auth Service

**src/app/services/auth.service.ts:**
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface LoginResponse {
  user: any;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(userName: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      userName,
      password
    }).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.userType === 1;
  }

  isTeacher(): boolean {
    const user = this.getCurrentUser();
    return user?.userType === 2;
  }

  isStudent(): boolean {
    const user = this.getCurrentUser();
    return user?.userType === 3;
  }

  isParent(): boolean {
    const user = this.getCurrentUser();
    return user?.userType === 4;
  }
}
```

## Step 4: Create HTTP Interceptor

**src/app/interceptors/auth.interceptor.ts:**
```typescript
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    
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

## Step 5: Update App Config

**src/app/app.config.ts:**
```typescript
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors, HTTP_INTERCEPTORS } from '@angular/common/http';
import { routes } from './app.routes';
import { AuthInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
};
```

## Step 6: Update UserService

Replace your existing UserService with HTTP calls:

**src/app/services/user.service.ts:**
```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(userType?: number, search?: string): Observable<any> {
    let params = new HttpParams();
    if (userType) params = params.set('userType', userType.toString());
    if (search) params = params.set('search', search);
    
    return this.http.get(this.apiUrl, { params });
  }

  getUser(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  createUser(userData: any): Observable<any> {
    return this.http.post(this.apiUrl, userData);
  }

  updateUser(id: number, userData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, userData);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  searchUsers(query: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/search`, {
      params: { q: query }
    });
  }
}
```

## Step 7: Create Additional Services

### Student Service
**src/app/services/student.service.ts:**
```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = `${environment.apiUrl}/students`;

  constructor(private http: HttpClient) {}

  getStudents(search?: string): Observable<any> {
    const params = search ? { search } : {};
    return this.http.get(this.apiUrl, { params });
  }

  getStudent(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getPerformance(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/performance`);
  }

  getReport(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/report`);
  }

  addTestResult(studentId: number, resultData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${studentId}/test-results`, resultData);
  }

  updateTestResult(studentId: number, resultId: number, resultData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${studentId}/test-results/${resultId}`, resultData);
  }
}
```

### Attendance Service
**src/app/services/attendance.service.ts:**
```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = `${environment.apiUrl}/attendance`;

  constructor(private http: HttpClient) {}

  getAttendance(filters?: any): Observable<any> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params = params.set(key, filters[key]);
        }
      });
    }
    return this.http.get(this.apiUrl, { params });
  }

  createAttendance(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  bulkCreateAttendance(attendanceList: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/bulk`, { attendance: attendanceList });
  }

  updateAttendance(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  getStatistics(studentId: number, subjectId?: number): Observable<any> {
    const params = subjectId ? { subjectId: subjectId.toString() } : {};
    return this.http.get(`${this.apiUrl}/statistics/${studentId}`, { params });
  }
}
```

## Step 8: Update Login Component

**src/app/components/login/login.component.ts:**
```typescript
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  userName = '';
  password = '';
  error = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    this.authService.login(this.userName, this.password).subscribe({
      next: (response) => {
        // Redirect based on user type
        const userType = response.user.userType;
        if (userType === 1) {
          this.router.navigate(['/admin-dashboard']);
        } else if (userType === 2) {
          this.router.navigate(['/teacher-dashboard']);
        } else if (userType === 3) {
          this.router.navigate(['/student-dashboard']);
        }
      },
      error: (error) => {
        this.error = 'Invalid username or password';
        console.error('Login error:', error);
      }
    });
  }
}
```

## Step 9: Create Route Guard

**src/app/guards/auth.guard.ts:**
```typescript
import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Check user type if specified in route data
    const requiredType = route.data['userType'];
    if (requiredType) {
      const user = this.authService.getCurrentUser();
      if (user.userType !== requiredType) {
        this.router.navigate(['/']);
        return false;
      }
    }

    return true;
  }
}
```

## Step 10: Update Routes

**src/app/app.routes.ts:**
```typescript
import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { TeacherDashboardComponent } from './components/teacher-dashboard/teacher-dashboard.component';
import { StudentDashboardComponent } from './components/student-dashboard/student-dashboard.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'admin-dashboard', 
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    data: { userType: 1 }
  },
  { 
    path: 'teacher-dashboard', 
    component: TeacherDashboardComponent,
    canActivate: [AuthGuard],
    data: { userType: 2 }
  },
  { 
    path: 'student-dashboard', 
    component: StudentDashboardComponent,
    canActivate: [AuthGuard],
    data: { userType: 3 }
  },
];
```

## Step 11: Example Dashboard Implementation

**src/app/components/student-dashboard/student-dashboard.component.ts:**
```typescript
import { Component, OnInit } from '@angular/core';
import { StudentService } from '../../services/student.service';
import { AttendanceService } from '../../services/attendance.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-student-dashboard',
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css']
})
export class StudentDashboardComponent implements OnInit {
  performance: any;
  attendanceStats: any;
  loading = true;

  constructor(
    private studentService: StudentService,
    private attendanceService: AttendanceService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    const studentId = user.student.studentId;

    // Load performance data
    this.studentService.getPerformance(studentId).subscribe({
      next: (data) => {
        this.performance = data;
        this.loading = false;
      },
      error: (error) => console.error('Error loading performance:', error)
    });

    // Load attendance stats
    this.attendanceService.getStatistics(studentId).subscribe({
      next: (data) => {
        this.attendanceStats = data;
      },
      error: (error) => console.error('Error loading attendance:', error)
    });
  }
}
```

## Step 12: Remove Old Database Service

Since you're now using the Laravel backend API, you can remove:
- `src/app/services/database.service.ts` (if it exists)
- `src/app/config/database.config.ts`
- Any direct MySQL imports

## Testing the Integration

1. Start Laravel backend:
   ```bash
   cd backend
   php artisan serve
   ```

2. Start Angular frontend:
   ```bash
   ng serve
   ```

3. Open browser: `http://localhost:4200`

4. Login with test credentials:
   - Username: `admin`
   - Password: `admin123`

## Common Issues & Solutions

### CORS Errors
**Problem:** Browser blocks requests

**Solution:** Laravel backend already configured CORS. Ensure:
1. `FRONTEND_URL=http://localhost:4200` in backend `.env`
2. Clear Laravel config: `php artisan config:clear`

### 401 Unauthorized
**Problem:** Token not being sent

**Solution:** Check that:
1. AuthInterceptor is properly registered
2. Token is stored after login
3. Token format is `Bearer {token}`

### Can't Access Endpoints
**Problem:** 403 Forbidden errors

**Solution:** Check user has correct userType for endpoint

## Summary

You've now:
✅ Connected Angular to Laravel API  
✅ Implemented authentication with tokens  
✅ Created services for all entities  
✅ Added route guards for security  
✅ Removed direct database access  

Your Angular app now communicates with Laravel backend through REST API!

