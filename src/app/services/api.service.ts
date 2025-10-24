import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  // Get authorization headers
  private getHeaders(): HttpHeaders {
    // In a real app, you'd get the token from storage
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });
  }

  // Authentication endpoints
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, { username, password }, { headers: this.getHeaders() });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { headers: this.getHeaders() });
  }

  getCurrentUser(userId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/me`, { userId }, { headers: this.getHeaders() });
  }

  // Students endpoints
  getStudents(): Observable<any> {
    return this.http.get(`${this.apiUrl}/students`, { headers: this.getHeaders() });
  }

  getStudent(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/students/${id}`, { headers: this.getHeaders() });
  }

  createStudent(studentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/students`, studentData, { headers: this.getHeaders() });
  }

  updateStudent(studentId: number, studentData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/students/${studentId}`, studentData, { headers: this.getHeaders() });
  }

  getStudentPerformance(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/students/${id}/performance`, { headers: this.getHeaders() });
  }

  getStudentReport(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/students/${id}/report`, { headers: this.getHeaders() });
  }

  // Users endpoints
  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`, { headers: this.getHeaders() });
  }

  // Tests endpoints
  getTests(): Observable<any> {
    return this.http.get(`${this.apiUrl}/tests`, { headers: this.getHeaders() });
  }

  createTest(testData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/tests`, testData, { headers: this.getHeaders() });
  }

  updateTest(testId: number, testData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/tests/${testId}`, testData, { headers: this.getHeaders() });
  }

  getTestResults(testId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/tests/${testId}/results`, { headers: this.getHeaders() });
  }

  addTestResult(testId: number, resultData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/tests/${testId}/results`, resultData, { headers: this.getHeaders() });
  }

  // Subjects endpoints
  getSubjects(): Observable<any> {
    return this.http.get(`${this.apiUrl}/subjects`, { headers: this.getHeaders() });
  }

  getSubjectDetails(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/subjects/${id}`, { headers: this.getHeaders() });
  }

  createSubject(subjectData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/subjects`, subjectData, { headers: this.getHeaders() });
  }

  updateSubject(subjectId: number, subjectData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/subjects/${subjectId}`, subjectData, { headers: this.getHeaders() });
  }

  deleteSubject(subjectId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/subjects/${subjectId}`, { headers: this.getHeaders() });
  }

  // Attendance endpoints
  getAttendance(): Observable<any> {
    return this.http.get(`${this.apiUrl}/attendance`, { headers: this.getHeaders() });
  }

  markAttendance(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/attendance`, data, { headers: this.getHeaders() });
  }

  saveAttendance(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/attendance/bulk`, data, { headers: this.getHeaders() });
  }

  getAttendanceByDate(date: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/attendance/by-date/${date}`, { headers: this.getHeaders() });
  }

  getAttendanceReport(dateFrom: string, dateTo: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/reports/attendance?date_from=${dateFrom}&date_to=${dateTo}`, { headers: this.getHeaders() });
  }

  // Parents endpoints
  getParents(): Observable<any> {
    return this.http.get(`${this.apiUrl}/parents`, { headers: this.getHeaders() });
  }

  getParent(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/parents/${id}`, { headers: this.getHeaders() });
  }

  getParentByUserId(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/parents/by-user/${userId}`, { headers: this.getHeaders() });
  }

  createParent(parentData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/parents`, parentData, { headers: this.getHeaders() });
  }

  updateParent(parentId: number, parentData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/parents/${parentId}`, parentData, { headers: this.getHeaders() });
  }

  assignStudentToParent(parentId: number, studentId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/parents/${parentId}/assign-student`, { studentId }, { headers: this.getHeaders() });
  }

  getStudentsWithoutParents(): Observable<any> {
    return this.http.get(`${this.apiUrl}/students/without-parents`, { headers: this.getHeaders() });
  }

  updateStudentParent(studentId: number, parentId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/students/${studentId}/parent`, { parentId }, { headers: this.getHeaders() });
  }

  // Additional student-specific endpoints
  getStudentTestResults(studentId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/students/${studentId}/test-results`, { headers: this.getHeaders() });
  }

  getStudentAttendance(studentId: number, month?: string): Observable<any> {
    let url = `${this.apiUrl}/attendance/statistics/${studentId}`;
    if (month) {
      url += `?month=${month}`;
    }
    return this.http.get(url, { headers: this.getHeaders() });
  }

  getAvailableMonths(studentId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/attendance/months/${studentId}`, { headers: this.getHeaders() });
  }

  // Teachers endpoints
  getTeachers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/teachers`, { headers: this.getHeaders() });
  }

  createTeacher(teacherData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/teachers`, teacherData, { headers: this.getHeaders() });
  }

  getTeacher(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/teachers/${id}`, { headers: this.getHeaders() });
  }

  // Grades endpoints
  getGrades(): Observable<any> {
    return this.http.get(`${this.apiUrl}/grades`, { headers: this.getHeaders() });
  }

  createGrade(gradeData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/grades`, gradeData, { headers: this.getHeaders() });
  }
}