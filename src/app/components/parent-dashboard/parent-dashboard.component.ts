import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-parent-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './parent-dashboard.component.html',
  styleUrl: './parent-dashboard.component.css',
  providers: [ApiService]
})
export class ParentDashboardComponent implements OnInit {
  activeView: string = 'dashboard';
  parentName: string = 'Parent';
  parentData: any = null;
  parentId: number | null = null;
  userId: number | null = null;
  students: any[] = []; // Array of all students for this parent
  selectedStudent: any = null; // Currently selected student
  studentData: any = null;
  studentPerformance: any = null;
  studentAttendance: any = null;
  studentTestResults: any[] = [];
  notifications: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  
  // Performance metrics
  studentOverallAverage: number = 0;
  studentAttendanceRate: number = 0;
  totalTests: number = 0;
  completedTests: number = 0;
  
  // Attendance stats
  presentCount: number = 0;
  absentCount: number = 0;
  lateCount: number = 0;
  totalAttendance: number = 0;
  
  // Monthly attendance filter
  availableMonths: any[] = [];
  selectedMonth: string = '';
  isMonthlyView: boolean = false;
  
  // Subject performance
  subjectPerformance: any[] = [];
  
  // Grade distribution
  gradeDistribution: { [key: string]: number } = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    F: 0
  };

  constructor(
    private apiService: ApiService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    console.log('🎬 Parent Dashboard ngOnInit called');
    this.loadParentData();
  }

  private loadParentData() {
    // Get user data from storage
    if (isPlatformBrowser(this.platformId)) {
      const storedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        this.userId = user.userId;
        this.parentName = user.userName;
        this.loadParentDetails();
      } else {
        this.router.navigate(['/login']);
      }
    }
  }

  private loadParentDetails() {
    if (!this.userId) return;
    
    console.log('🔄 Loading parent details for userId:', this.userId);
    this.isLoading = true;
    this.errorMessage = '';

    // Get parent details by user ID
    this.apiService.getParentByUserId(this.userId).subscribe({
      next: (response) => {
        console.log('✅ Parent details response:', response);
        if (response.success && response.parent) {
          this.parentData = response.parent;
          this.parentId = response.parent.parentId;
          this.students = response.students || [];
          
          console.log('👨‍👩‍👧‍👦 Students found:', this.students);
          
          if (this.students.length > 0) {
            // Auto-select the first student
            this.selectedStudent = this.students[0];
            console.log('🎯 Selected student:', this.selectedStudent);
            this.loadStudentData(this.selectedStudent.studentId);
          } else {
            this.isLoading = false;
            this.errorMessage = 'No students linked to this parent account';
          }
        } else {
          this.errorMessage = response.message || 'Failed to load parent details';
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('❌ Error loading parent details:', error);
        this.errorMessage = 'Failed to load parent details';
        this.isLoading = false;
      }
    });
  }

  private loadStudentData(studentId: number) {
    // Reset data loading state
    this.studentPerformance = null;
    this.studentAttendance = null;
    this.studentTestResults = [];
    
    // Set a timeout fallback
    setTimeout(() => {
      if (this.isLoading) {
        console.warn('⚠️ Data loading timeout - forcing completion');
        this.isLoading = false;
        if (!this.studentData) {
          this.errorMessage = 'Timeout loading student data';
        }
      }
    }, 5000); // 5 second timeout
    
    // Get student details
    this.apiService.getStudent(studentId).subscribe({
      next: (response) => {
        console.log('✅ Student details:', response);
        this.studentData = response;
        
        // Load other data in parallel
        this.loadStudentPerformance(studentId);
        this.loadStudentAttendance(studentId);
        this.loadStudentTestResults(studentId);
        
        // Hide loading after basic student data is loaded
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error loading student details:', error);
        this.errorMessage = 'Failed to load student details';
        this.isLoading = false;
      }
    });
  }

  private loadStudentPerformance(studentId: number) {
    console.log('🔄 Loading performance for student:', studentId);
    this.apiService.getStudentPerformance(studentId).subscribe({
      next: (response) => {
        console.log('✅ Student performance response:', response);
        this.studentPerformance = response;
        this.calculatePerformanceMetrics(response);
      },
      error: (error) => {
        console.error('❌ Error loading student performance:', error);
        // Set empty data so UI doesn't break
        this.studentPerformance = { average: 0, subjectPerformance: [] };
      }
    });
  }

  private loadStudentAttendance(studentId: number) {
    console.log('🔄 Loading attendance for student:', studentId);
    
    // Load available months first
    this.apiService.getAvailableMonths(studentId).subscribe({
      next: (response) => {
        console.log('✅ Available months:', response);
        if (response.success) {
          this.availableMonths = response.months;
        }
      },
      error: (error) => {
        console.error('❌ Error loading available months:', error);
        this.availableMonths = [];
      }
    });
    
    // Load attendance data
    const monthParam = this.selectedMonth || undefined;
    this.apiService.getStudentAttendance(studentId, monthParam).subscribe({
      next: (response) => {
        console.log('✅ Student attendance response:', response);
        this.studentAttendance = response;
        this.calculateAttendanceMetrics(response);
      },
      error: (error) => {
        console.error('❌ Error loading student attendance:', error);
        // Set empty data so UI doesn't break
        this.studentAttendance = { present: 0, absent: 0, late: 0, total: 0 };
      }
    });
  }

  private loadStudentTestResults(studentId: number) {
    console.log('🔄 Loading test results for student:', studentId);
    this.apiService.getStudentTestResults(studentId).subscribe({
      next: (response) => {
        console.log('✅ Student test results response:', response);
        this.studentTestResults = response;
        this.calculateTestMetrics(response);
      },
      error: (error) => {
        console.error('❌ Error loading student test results:', error);
        // Set empty data so UI doesn't break
        this.studentTestResults = [];
      }
    });
  }

  private calculatePerformanceMetrics(performance: any) {
    if (performance && performance.average) {
      this.studentOverallAverage = performance.average;
    }
    
    if (performance && performance.subjectPerformance) {
      this.subjectPerformance = performance.subjectPerformance;
    }
  }

  private calculateAttendanceMetrics(attendance: any) {
    if (attendance) {
      this.presentCount = attendance.present || 0;
      this.absentCount = attendance.absent || 0;
      this.lateCount = attendance.late || 0;
      this.totalAttendance = attendance.total || (this.presentCount + this.absentCount + this.lateCount);
      
      if (this.totalAttendance > 0) {
        this.studentAttendanceRate = (this.presentCount / this.totalAttendance) * 100;
      }
      
      console.log('📊 Attendance metrics calculated:', {
        present: this.presentCount,
        absent: this.absentCount,
        late: this.lateCount,
        total: this.totalAttendance,
        rate: this.studentAttendanceRate
      });
    }
  }

  private calculateTestMetrics(testResults: any[]) {
    this.totalTests = testResults.length;
    this.completedTests = testResults.filter(test => test.marks !== null).length;
    
    // Calculate grade distribution
    testResults.forEach(test => {
      if (test.grade) {
        const grade = test.grade.toUpperCase();
        if (this.gradeDistribution.hasOwnProperty(grade)) {
          this.gradeDistribution[grade] = (this.gradeDistribution[grade] || 0) + 1;
        }
      }
    });
  }

  selectStudent(studentId: string) {
    const student = this.students.find(s => s.studentId.toString() === studentId);
    if (student) {
      this.selectedStudent = student;
      this.loadStudentData(student.studentId);
    }
  }

  setActiveView(view: string) {
    this.activeView = view;
  }

  onMonthChange(month: string) {
    this.selectedMonth = month;
    this.isMonthlyView = month !== '';
    
    if (this.selectedStudent) {
      this.loadStudentAttendance(this.selectedStudent.studentId);
    }
  }

  clearMonthFilter() {
    this.selectedMonth = '';
    this.isMonthlyView = false;
    
    if (this.selectedStudent) {
      this.loadStudentAttendance(this.selectedStudent.studentId);
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
      sessionStorage.removeItem('currentUser');
    }
    this.router.navigate(['/login']);
  }

  getGradeColor(grade: string): string {
    switch (grade?.toUpperCase()) {
      case 'A': return '#4CAF50';
      case 'B': return '#8BC34A';
      case 'C': return '#FFC107';
      case 'D': return '#FF9800';
      case 'F': return '#F44336';
      default: return '#9E9E9E';
    }
  }

  getAttendanceStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'present': return '#4CAF50';
      case 'absent': return '#F44336';
      case 'late': return '#FF9800';
      default: return '#9E9E9E';
    }
  }
}
