import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { TeacherDashboardComponent } from './components/teacher-dashboard/teacher-dashboard.component';
import { StudentDashboardComponent } from './components/student-dashboard/student-dashboard.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent },
  { path: 'teacher/dashboard', component: TeacherDashboardComponent },
  { path: 'student/dashboard', component: StudentDashboardComponent },
  { path: 'parent/dashboard', component: LoginComponent }, // Temporary - will be replaced with actual dashboard
  { path: '**', redirectTo: '/login' }
];
