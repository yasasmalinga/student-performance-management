import { Component, Inject, PLATFORM_ID, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './student-dashboard.component.html',
  styleUrl: './student-dashboard.component.css',
  providers: [ApiService]
})
export class StudentDashboardComponent implements OnInit, AfterViewInit {
  activeView: string = 'dashboard';
  studentName: string = 'Jane Student';
  studentData: any = null;
  studentId: number | null = null;
  userId: number | null = null;
  subjects: any[] = [];
  testResults: any[] = [];
  upcomingTests: any[] = [];
  attendanceRecords: any[] = [];
  notifications: any[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  
  // Performance metrics
  overallAverage: number = 0;
  attendanceRate: number = 0;
  totalTests: number = 0;
  completedTests: number = 0;
  
  // Attendance stats
  presentCount: number = 0;
  absentCount: number = 0;
  lateCount: number = 0;
  totalAttendance: number = 0;
  
  // Subject performance
  subjectPerformance: any[] = [];
  
  // Grade distribution
  gradeDistribution = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    F: 0
  };

  // Grade selection
  gradesList: any[] = [];
  selectedGradeId: number | null = null;
  showGradeSelector: boolean = false;

  constructor(
    private apiService: ApiService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    console.log('🎬 ngOnInit called');
    this.loadStudentData();
    this.loadGrades();
    // Note: loadDashboardData() is now called from fetchStudentDetails()
  }

  ngAfterViewInit() {
    console.log('🎬 ngAfterViewInit called');
    // Ensure data loads in the browser after view initialization
    if (isPlatformBrowser(this.platformId)) {
      console.log('🌐 In browser platform - reloading data if needed');
      if (!this.userId || !this.studentId) {
        console.log('⚠️ No user/student data found, reloading...');
        setTimeout(() => this.loadStudentData(), 100);
      }
    }
  }

  loadStudentData() {
    console.log('🔍 Starting loadStudentData...');
    if (isPlatformBrowser(this.platformId)) {
      const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      console.log('📦 User data from storage:', userStr);
      if (userStr) {
        const user = JSON.parse(userStr);
        this.studentName = user.userName;
        this.userId = user.userId;
        console.log('👤 Loaded user:', { userName: this.studentName, userId: this.userId });
        
        // For the mock user jane_student (userId 3), we need to find the studentId
        // In the seeded data, students are created with sequential IDs
        // We'll fetch the student details from the database
        this.fetchStudentDetails();
      } else {
        console.warn('⚠️ No user data found in storage!');
      }
    } else {
      console.log('🌐 Not in browser platform, skipping loadStudentData');
    }
  }

  fetchStudentDetails() {
    if (!this.userId) {
      console.warn('No userId available');
      return;
    }
    
    console.log('Fetching student details for userId:', this.userId);
    
    // First, get all students and find the one with matching userId
    this.apiService.getStudents().subscribe({
      next: (response) => {
        console.log('All students response:', response);
        
        // The API returns a paginated response with a 'data' property
        const students = response.data || response;
        console.log('Students array:', students);
        
        const studentRecord = students.find((s: any) => s.userId === this.userId);
        if (studentRecord) {
          this.studentId = studentRecord.studentId;
          this.studentData = studentRecord;
          console.log('✅ Student ID found:', this.studentId, 'for user:', this.userId);
          // Now load the real dashboard data
          this.loadDashboardData();
        } else {
          console.warn('❌ Student record not found for userId:', this.userId);
          // Fall back to mock data
          this.loadDashboardData();
        }
      },
      error: (error) => {
        console.error('❌ Error fetching student details:', error);
        // Fall back to mock data
        this.loadDashboardData();
      }
    });
  }

  loadDashboardData() {
    this.isLoading = true;
    this.errorMessage = '';

    // Load all data
    this.loadSubjects();
    
    if (this.studentId) {
      // Load real data from database
      this.loadStudentReport();
    } else {
      // No student ID, set empty data
      this.testResults = [];
      this.attendanceRecords = [];
      this.upcomingTests = [];
      
      setTimeout(() => {
        this.calculateMetrics();
        this.isLoading = false;
      }, 500);
    }
  }

  loadSubjects() {
    this.apiService.getSubjects().subscribe({
      next: (data) => {
        this.subjects = data;
        console.log('Subjects loaded from database:', this.subjects.length);
      },
      error: (error) => {
        console.error('Error loading subjects:', error);
        this.subjects = [];
        console.log('No subjects found in database');
      }
    });
  }

  loadStudentReport() {
    if (!this.studentId) {
      console.warn('❌ No student ID available for loading report');
      this.isLoading = false;
      return;
    }

    console.log('📊 Loading student report for studentId:', this.studentId);
    this.apiService.getStudentReport(this.studentId).subscribe({
      next: (data) => {
        console.log('✅ Student report loaded from database:', data);
        console.log('📝 Test results count:', data.testResults?.length || 0);
        console.log('📅 Attendance records count:', data.attendance?.length || 0);
        
        // Process test results
        if (data.testResults && data.testResults.length > 0) {
          this.testResults = data.testResults.map((result: any) => ({
            testId: result.testId,
            subjectName: result.test?.subject?.subjectName || 'Unknown',
            testName: 'Test', // You can add test name to the database
            marks: result.marksObtained,
            maxMarks: result.test?.testMark || 100,
            date: result.test?.testDate || new Date().toISOString().split('T')[0],
            testType: result.test?.testType === 1 ? 'Exam' : 'Event',
            grade: result.grade,
            remarks: result.remarks
          }));
        } else {
          this.testResults = [];
          console.log('No test results found in database');
        }
        
        // Process attendance records
        if (data.attendance && data.attendance.length > 0) {
          console.log('📅 Processing attendance records:', data.attendance);
          this.attendanceRecords = data.attendance.map((record: any) => ({
            date: record.attendanceDate,
            status: record.status,
            subjectId: record.subjectId
          }));
          console.log('📅 Mapped attendance records:', this.attendanceRecords);
        } else {
          console.log('📅 No attendance data found in database');
          this.attendanceRecords = [];
        }
        
        // Load upcoming tests
        this.loadUpcomingTests();
        
        // Calculate metrics
        setTimeout(() => {
          this.calculateMetrics();
          this.isLoading = false;
        }, 300);
      },
      error: (error) => {
        console.error('Error loading student report:', error);
        this.testResults = [];
        this.attendanceRecords = [];
        this.upcomingTests = [];
        this.isLoading = false;
      }
    });
  }


  loadUpcomingTests() {
    // Load upcoming tests (tests with future dates)
    this.apiService.getTests().subscribe({
      next: (tests) => {
        const today = new Date();
        this.upcomingTests = tests
          .filter((test: any) => new Date(test.testDate) > today)
          .map((test: any) => ({
            testId: test.testId,
            subjectName: test.subject?.subjectName || 'Unknown',
            testName: test.testType === 1 ? 'Exam' : 'Event',
            maxMarks: test.testMark,
            date: test.testDate,
            testType: test.testType === 1 ? 'Exam' : 'Event',
            description: test.testDescription
          }))
          .slice(0, 5); // Limit to 5 upcoming tests
        
        console.log('Upcoming tests loaded from database:', this.upcomingTests.length);
      },
      error: (error) => {
        console.error('Error loading tests:', error);
        this.upcomingTests = [];
      }
    });
  }

  calculateMetrics() {
    console.log('🧮 Calculating metrics...');
    console.log('📊 Test results count:', this.testResults.length);
    console.log('📅 Attendance records count:', this.attendanceRecords.length);
    console.log('📅 Attendance records:', this.attendanceRecords);
    
    // Calculate overall average
    if (this.testResults.length > 0) {
      const totalMarks = this.testResults.reduce((sum, result) => sum + result.marks, 0);
      const totalPossible = this.testResults.reduce((sum, result) => sum + result.maxMarks, 0);
      this.overallAverage = totalPossible > 0 ? (totalMarks / totalPossible) * 100 : 0;
    }

    // Calculate attendance stats
    this.presentCount = this.attendanceRecords.filter(a => a.status === 'Present').length;
    this.absentCount = this.attendanceRecords.filter(a => a.status === 'Absent').length;
    this.lateCount = this.attendanceRecords.filter(a => a.status === 'Late').length;
    this.totalAttendance = this.attendanceRecords.length;
    this.attendanceRate = this.totalAttendance > 0 ? (this.presentCount / this.totalAttendance) * 100 : 0;
    
    console.log('📊 Calculated attendance stats:');
    console.log('  Present:', this.presentCount);
    console.log('  Absent:', this.absentCount);
    console.log('  Late:', this.lateCount);
    console.log('  Total:', this.totalAttendance);
    console.log('  Rate:', this.attendanceRate + '%');

    // Calculate test counts
    this.totalTests = this.upcomingTests.length + this.testResults.length;
    this.completedTests = this.testResults.length;

    // Calculate subject performance
    this.calculateSubjectPerformance();

    // Calculate grade distribution
    this.calculateGradeDistribution();
  }

  calculateSubjectPerformance() {
    const subjectMap = new Map();

    this.testResults.forEach(result => {
      if (!subjectMap.has(result.subjectName)) {
        subjectMap.set(result.subjectName, {
          subjectName: result.subjectName,
          totalMarks: 0,
          maxMarks: 0,
          testCount: 0
        });
      }

      const subject = subjectMap.get(result.subjectName);
      subject.totalMarks += result.marks;
      subject.maxMarks += result.maxMarks;
      subject.testCount++;
    });

    this.subjectPerformance = Array.from(subjectMap.values()).map(subject => ({
      ...subject,
      average: subject.maxMarks > 0 ? (subject.totalMarks / subject.maxMarks) * 100 : 0
    }));
  }

  calculateGradeDistribution() {
    this.gradeDistribution = { A: 0, B: 0, C: 0, D: 0, F: 0 };

    this.testResults.forEach(result => {
      const percentage = (result.marks / result.maxMarks) * 100;
      const grade = this.getGrade(percentage);
      this.gradeDistribution[grade as keyof typeof this.gradeDistribution]++;
    });
  }

  getGrade(percentage: number): string {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  }

  getGradeClass(percentage: number): string {
    if (percentage >= 90) return 'grade-a';
    if (percentage >= 80) return 'grade-b';
    if (percentage >= 70) return 'grade-c';
    if (percentage >= 60) return 'grade-d';
    return 'grade-f';
  }

  getPerformanceClass(percentage: number): string {
    if (percentage >= 80) return 'high';
    if (percentage >= 60) return 'medium';
    return 'low';
  }

  switchView(view: string) {
    this.activeView = view;
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
      sessionStorage.removeItem('currentUser');
    }
    this.router.navigate(['/login']);
  }


  getDaysUntilTest(testDate: string): number {
    const today = new Date();
    const test = new Date(testDate);
    const diffTime = test.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  // Grade-related methods
  loadGrades() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.apiService.getGrades().subscribe({
      next: (response) => {
        this.gradesList = response.data || response;
        console.log('✅ Grades loaded:', this.gradesList);
        
        // Set current student's grade if available
        if (this.studentData && this.studentData.gradeId) {
          this.selectedGradeId = this.studentData.gradeId;
        }
      },
      error: (error) => {
        console.error('❌ Error loading grades:', error);
        this.errorMessage = 'Failed to load grades';
      }
    });
  }

  onGradeChange(gradeId: any) {
    this.selectedGradeId = gradeId ? parseInt(gradeId) : null;
    console.log('📝 Grade changed to:', this.selectedGradeId);
  }

  getGradeName(gradeId: any): string {
    const grade = this.gradesList.find(g => g.gradeId == gradeId);
    return grade ? grade.gradeName : '';
  }

  updateStudentGrade() {
    if (!this.studentId || !this.selectedGradeId) {
      alert('Please select a grade');
      return;
    }

    this.isLoading = true;
    const updateData = {
      gradeId: this.selectedGradeId
    };

    this.apiService.updateStudent(this.studentId, updateData).subscribe({
      next: (response) => {
        console.log('✅ Student grade updated:', response);
        this.studentData.gradeId = this.selectedGradeId;
        this.showGradeSelector = false;
        this.isLoading = false;
        alert('Grade updated successfully!');
      },
      error: (error) => {
        console.error('❌ Error updating grade:', error);
        this.errorMessage = 'Failed to update grade';
        this.isLoading = false;
        alert('Failed to update grade. Please try again.');
      }
    });
  }

  toggleGradeSelector() {
    this.showGradeSelector = !this.showGradeSelector;
  }
}
