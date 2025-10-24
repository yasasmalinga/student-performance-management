import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './teacher-dashboard.component.html',
  styleUrl: './teacher-dashboard.component.css',
  providers: [ApiService]
})
export class TeacherDashboardComponent implements OnInit {
  activeView: string = 'dashboard';
  teacherName: string = 'John Teacher';
  teacherId: number | null = null;
  userId: number | null = null;
  students: any[] = [];
  subjects: any[] = [];
  attendance: any[] = [];
  tests: any[] = [];
  studentGrades: any[] = [];
  allStudentGrades: any[] = [];
  gradesList: any[] = [];
  gradesFilter: string = 'all';
  reportDateFrom: string = '';
  reportDateTo: string = '';
  selectedSubjectForReport: string = '';
  selectedGradeForReport: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  selectedDate: string = new Date().toISOString().split('T')[0];
  selectedGradeForAttendance: string = '';
  selectedSectionForAttendance: string = '';
  
  // Student filtering
  filteredStudents: any[] = [];
  studentFilters = {
    grade: '',
    section: '',
    status: '',
    searchTerm: ''
  };
  availableSections: string[] = ['A', 'B', 'C', 'D', 'E'];
  showAddStudentModal: boolean = false;
  showEditStudentModal: boolean = false;
  showAddSubjectModal: boolean = false;
  showEditSubjectModal: boolean = false;
  showSubjectDetailsModal: boolean = false;
  showManageSubjectModal: boolean = false;
  showAddTestModal: boolean = false;
  showEditTestModal: boolean = false;
  showTestDetailsModal: boolean = false;
  showManageTestResultsModal: boolean = false;
  showAddResultModal: boolean = false;
  showAssignParentModal: boolean = false;
  showStudentDetailsModal: boolean = false;
  parentModalTab: string = 'create';
  selectedStudent: any = null;
  selectedSubject: any = null;
  selectedTest: any = null;
  studentDetails: any = null;
  subjectDetails: any = null;
  testDetails: any = null;
  availableParents: any[] = [];
  testResults: any[] = [];
  editStudent: any = {
    userName: '',
    userEmail: '',
    userContact: '',
    studentNumber: '',
    dateOfBirth: '',
    enrollmentDate: ''
  };
  newStudent: any = {
    userName: '',
    password: '',
    userEmail: '',
    userContact: '',
    studentNumber: '',
    dateOfBirth: '',
    enrollmentDate: '',
    gradeId: '',
    grade: '',
    section: ''
  };
  newSubject: any = {
    subjectName: '',
    subjectType: 1, // 1 = Academic, 2 = Non-Academic
    description: ''
  };
  editSubjectData: any = {
    subjectName: '',
    subjectType: 1,
    description: ''
  };
  newParent: any = {
    userName: '',
    password: '',
    userEmail: '',
    userContact: '',
    occupation: ''
  };
  newTest: any = {
    testType: 1, // 1 = Exam, 2 = Event
    testMark: '',
    testDate: new Date().toISOString().split('T')[0],
    subjectId: '',
    testDescription: '',
    testClass: ''
  };
  editTestData: any = {
    testMark: '',
    testDate: '',
    subjectId: '',
    testDescription: '',
    testClass: ''
  };
  newResult: any = {
    studentId: '',
    marksObtained: '',
    grade: '',
    remarks: ''
  };

  constructor(
    private router: Router,
    private apiService: ApiService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Load teacher info from storage (only in browser)
    if (isPlatformBrowser(this.platformId)) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || '{}');
      if (currentUser.userName) {
        this.teacherName = currentUser.userName;
        this.userId = currentUser.userId;
        console.log('👨‍🏫 Teacher logged in:', this.teacherName, 'UserID:', this.userId);
      }
    }
  }

  ngOnInit() {
    // Load initial data
    if (isPlatformBrowser(this.platformId)) {
      console.log('🎬 Teacher Dashboard - Loading initial data...');
      this.loadTeacherDetails();
      this.loadGradesList();
      this.loadStudents();
      this.loadSubjects();
      this.loadTests();
    }
  }

  loadTeacherDetails() {
    if (!this.userId) {
      console.warn('⚠️ No userId available for teacher');
      return;
    }

    // Get teacher record from users table
    this.apiService.getTeachers().subscribe({
      next: (response) => {
        const teachers = response.data || response;
        const teacherRecord = teachers.find((t: any) => t.userId === this.userId);
        
        if (teacherRecord) {
          this.teacherId = teacherRecord.teacherId;
          console.log('✅ Teacher ID found:', this.teacherId, 'for user:', this.userId);
        } else {
          console.warn('❌ Teacher record not found for userId:', this.userId);
        }
      },
      error: (error) => {
        console.error('❌ Error fetching teacher details:', error);
      }
    });
  }

  loadGradesList() {
    this.apiService.getGrades().subscribe({
      next: (grades) => {
        this.gradesList = grades;
        console.log('📚 Grades loaded:', this.gradesList.length);
      },
      error: (error) => {
        console.error('Error loading grades:', error);
        this.gradesList = [];
      }
    });
  }

  setActiveView(view: string) {
    this.activeView = view;
    
    // Load data when switching to specific views
    if (view === 'students' && this.students.length === 0) {
      this.loadStudents();
    }
    if (view === 'subjects' && this.subjects.length === 0) {
      this.loadSubjects();
    }
    if (view === 'attendance') {
      this.loadAttendance();
    }
    if (view === 'tests' && this.tests.length === 0) {
      this.loadTests();
    }
    if (view === 'grades' && this.studentGrades.length === 0) {
      this.loadGrades();
    }
    if (view === 'reports') {
      // Load necessary data for reports
      if (this.subjects.length === 0) {
        this.loadSubjects();
      }
      if (this.students.length === 0) {
        this.loadStudents();
      }
      if (this.tests.length === 0) {
        this.loadTests();
      }
      if (this.allStudentGrades.length === 0) {
        this.loadGrades();
      }
    }
  }

  loadStudents() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    // Fetch real students from Laravel API
    this.apiService.getStudents().subscribe({
      next: (response) => {
        console.log('API Response:', response);
        
        // Map the API response to our frontend format
        const students = response.data || response;
        this.students = students.map((student: any) => ({
          id: student.studentId,
          name: student.user?.userName || 'Unknown',
          studentNumber: student.studentNumber,
          email: student.user?.userEmail || '',
          contact: student.user?.userContact || '',
          dateOfBirth: student.dateOfBirth ? student.dateOfBirth.split('T')[0] : '',
          enrollmentDate: student.enrollmentDate ? student.enrollmentDate.split('T')[0] : '',
          gradeId: student.gradeId,
          grade: student.grade_level?.gradeName || student.grade || null,
          section: student.section || null,
          class: student.testClass || 'N/A',
          averageMarks: student.averageMarks || 0,
          attendance: student.attendanceRate || '0%',
          status: 'Active',
          parentId: student.parentId,
          parentName: student.parent?.user?.userName || null
        }));
        
        // Initialize filtered students
        this.applyStudentFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.errorMessage = 'Failed to load students from database.';
        this.students = [];
        this.isLoading = false;
      }
    });
  }

  isActive(view: string): boolean {
    return this.activeView === view;
  }

  loadSubjects() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    // Fetch real subjects from Laravel API
    this.apiService.getSubjects().subscribe({
      next: (response) => {
        console.log('Subjects API Response:', response);
        
        // Map the API response to our frontend format
        this.subjects = response.map((subject: any) => ({
          id: subject.subjectId,
          name: subject.subjectName,
          type: subject.subjectType === 1 ? 'Academic' : 'Non-Academic',
          description: subject.description || 'No description',
          teachersCount: subject.teachers?.length || 0,
          studentsCount: subject.students_count || 0
        }));
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading subjects:', error);
        this.errorMessage = 'Failed to load subjects from database.';
        this.isLoading = false;
      }
    });
  }

  openAddStudentModal() {
    this.showAddStudentModal = true;
    this.resetNewStudentForm();
  }

  closeAddStudentModal() {
    this.showAddStudentModal = false;
    this.resetNewStudentForm();
  }

  resetNewStudentForm() {
    this.newStudent = {
      userName: '',
      password: '',
      userEmail: '',
      userContact: '',
      studentNumber: '',
      dateOfBirth: '',
      enrollmentDate: new Date().toISOString().split('T')[0], // Today's date
      gradeId: '',
      grade: '',
      section: ''
    };
  }

  onGradeChange(gradeId: any) {
    // When a grade is selected, automatically populate the grade text field
    const selectedGrade = this.gradesList.find(g => g.gradeId == gradeId);
    if (selectedGrade) {
      this.newStudent.grade = selectedGrade.gradeName;
      console.log('✅ Grade selected:', selectedGrade.gradeName);
    }
  }

  getGradeName(gradeId: any): string {
    const grade = this.gradesList.find(g => g.gradeId == gradeId);
    return grade ? grade.gradeName : '';
  }

  addStudent() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Validate form
    if (!this.newStudent.userName || !this.newStudent.password || !this.newStudent.userEmail || !this.newStudent.studentNumber) {
      alert('Please fill in all required fields (Username, Password, Email, Student Number)');
      return;
    }

    if (!this.newStudent.gradeId || !this.newStudent.section) {
      alert('Please select Grade and Section');
      return;
    }

    console.log('📝 Form data (newStudent):', this.newStudent);
    this.isLoading = true;

    // Prepare data for API
    const studentData = {
      userName: this.newStudent.userName,
      password: this.newStudent.password,
      userType: 3, // Student type
      userEmail: this.newStudent.userEmail,
      userContact: this.newStudent.userContact,
      studentNumber: this.newStudent.studentNumber,
      dateOfBirth: this.newStudent.dateOfBirth,
      enrollmentDate: this.newStudent.enrollmentDate,
      gradeId: this.newStudent.gradeId ? parseInt(this.newStudent.gradeId) : null,
      grade: this.newStudent.grade,
      section: this.newStudent.section
    };
    
    console.log('🚀 Sending to API:', studentData);
    console.log('  → gradeId:', studentData.gradeId, '(type:', typeof studentData.gradeId, ')');

    // Call API to create student
    this.apiService.createStudent(studentData).subscribe({
      next: (response) => {
        console.log('Student created:', response);
        this.loadStudents(); // Reload the list
        this.closeAddStudentModal();
        this.isLoading = false;
        alert('Student added successfully!');
      },
      error: (error) => {
        console.error('❌ Error creating student:', error);
        console.error('Full error details:', JSON.stringify(error.error, null, 2));
        
        let errorMessage = 'Failed to add student.\n\n';
        
        if (error.error && error.error.message) {
          errorMessage += 'Message: ' + error.error.message + '\n';
        }
        
        if (error.error && error.error.errors) {
          // Validation errors
          errorMessage += 'Validation Errors:\n';
          Object.keys(error.error.errors).forEach(key => {
            const messages = error.error.errors[key];
            errorMessage += `  - ${key}: ${messages.join(', ')}\n`;
          });
        } else if (error.message) {
          errorMessage += error.message;
        }
        
        alert(errorMessage);
        this.isLoading = false;
      }
    });
  }

  openAddSubjectModal() {
    this.showAddSubjectModal = true;
    this.resetNewSubjectForm();
  }

  closeAddSubjectModal() {
    this.showAddSubjectModal = false;
    this.resetNewSubjectForm();
  }

  resetNewSubjectForm() {
    this.newSubject = {
      subjectName: '',
      subjectType: 1, // Academic by default
      description: ''
    };
  }

  addSubject() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Validate form
    if (!this.newSubject.subjectName) {
      alert('Please enter a subject name');
      return;
    }

    this.isLoading = true;

    // Prepare data for API
    const subjectData = {
      subjectName: this.newSubject.subjectName,
      subjectType: parseInt(this.newSubject.subjectType),
      description: this.newSubject.description
    };

    // Call API to create subject
    this.apiService.createSubject(subjectData).subscribe({
      next: (response) => {
        console.log('Subject created:', response);
        this.loadSubjects(); // Reload the list
        this.closeAddSubjectModal();
        this.isLoading = false;
        alert('Subject added successfully!');
      },
      error: (error) => {
        console.error('Error creating subject:', error);
        let errorMessage = 'Failed to add subject. ';
        
        if (error.error && error.error.message) {
          errorMessage += error.error.message;
        } else if (error.error && error.error.errors) {
          const errors = Object.values(error.error.errors).flat();
          errorMessage += errors.join(', ');
        } else if (error.message) {
          errorMessage += error.message;
        }
        
        alert(errorMessage);
        this.isLoading = false;
      }
    });
  }

  // Reports Methods
  generateOverallReport() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    if (this.allStudentGrades.length === 0) {
      alert('Please wait, loading student data...');
      return;
    }

    // Filter by grade if selected
    let studentsForReport = this.allStudentGrades;
    if (this.selectedGradeForReport) {
      studentsForReport = this.allStudentGrades.filter((s: any) => s.gradeId == this.selectedGradeForReport);
      console.log(`📊 Generating report for grade ${this.selectedGradeForReport}: ${studentsForReport.length} students`);
    }

    const reportHtml = this.createOverallPerformanceReportHtml(studentsForReport);
    this.openReportInNewWindow(reportHtml);
  }

  generateAttendanceSummaryReport() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    if (!this.reportDateFrom || !this.reportDateTo) {
      alert('Please select date range for the attendance report');
      return;
    }

    this.isLoading = true;

    this.apiService.getAttendanceReport(this.reportDateFrom, this.reportDateTo).subscribe({
      next: (response) => {
        const reportHtml = this.createAttendanceSummaryReportHtml(response);
        this.openReportInNewWindow(reportHtml);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error:', error);
        alert('Failed to generate attendance report');
        this.isLoading = false;
      }
    });
  }

  generateSubjectReport() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const subject = this.subjects.find(s => s.id == this.selectedSubjectForReport);
    if (!subject) {
      alert('Please select a subject');
      return;
    }

    if (this.allStudentGrades.length === 0) {
      alert('Please wait, loading student data...');
      this.loadGrades();
      return;
    }

    const reportHtml = this.createSubjectPerformanceReportHtml(subject);
    this.openReportInNewWindow(reportHtml);
  }

  generateTopPerformersReport() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    // Filter by grade if selected
    let studentsForReport = this.allStudentGrades;
    if (this.selectedGradeForReport) {
      studentsForReport = this.allStudentGrades.filter((s: any) => s.gradeId == this.selectedGradeForReport);
    }
    
    const topStudents = [...studentsForReport]
      .sort((a, b) => b.averageMarks - a.averageMarks)
      .slice(0, 10);

    const gradeName = this.selectedGradeForReport ? this.getGradeName(this.selectedGradeForReport) : 'All Grades';
    const reportHtml = this.createTopPerformersReportHtml(topStudents, gradeName);
    this.openReportInNewWindow(reportHtml);
  }

  generateLowPerformersReport() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    // Filter by grade if selected
    let studentsForReport = this.allStudentGrades;
    if (this.selectedGradeForReport) {
      studentsForReport = this.allStudentGrades.filter((s: any) => s.gradeId == this.selectedGradeForReport);
    }
    
    const lowPerformers = studentsForReport.filter(s => s.averageMarks < 70);

    if (lowPerformers.length === 0) {
      const gradeName = this.selectedGradeForReport ? this.getGradeName(this.selectedGradeForReport) : 'All students';
      alert(`Great news! ${gradeName} are performing well (≥70%)`);
      return;
    }

    const gradeName = this.selectedGradeForReport ? this.getGradeName(this.selectedGradeForReport) : 'All Grades';
    const reportHtml = this.createLowPerformersReportHtml(lowPerformers, gradeName);
    this.openReportInNewWindow(reportHtml);
  }

  generateClassSummaryReport() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    const reportHtml = this.createClassSummaryReportHtml();
    this.openReportInNewWindow(reportHtml);
  }

  openReportInNewWindow(html: string) {
    const reportWindow = window.open('', '_blank', 'width=900,height=700');
    if (reportWindow) {
      reportWindow.document.write(html);
      reportWindow.document.close();
      setTimeout(() => reportWindow.print(), 500);
    }
  }

  createOverallPerformanceReportHtml(students: any[]): string {
    const avgMarks = students.reduce((sum, s) => sum + s.averageMarks, 0) / students.length || 0;
    const highPerformers = students.filter(s => s.averageMarks >= 85).length;
    
    const gradeName = this.selectedGradeForReport ? this.getGradeName(this.selectedGradeForReport) : 'All Grades';
    
    const rows = students.map(s => `
      <tr>
        <td>${s.studentNumber}</td>
        <td>${s.name}</td>
        <td>${s.totalTests}</td>
        <td><span class="marks-badge">${s.averageMarks.toFixed(1)}%</span></td>
        <td><span class="grade-badge-${s.overallGrade.replace('+', 'plus')}">${s.overallGrade}</span></td>
      </tr>
    `).join('');

    return this.createReportTemplate('Overall Academic Performance Report', `
      <div class="summary-box">
        <h3>Class Summary - ${gradeName}</h3>
        <p><strong>Grade/Class:</strong> ${gradeName}</p>
        <p><strong>Total Students:</strong> ${students.length}</p>
        <p><strong>Class Average:</strong> ${avgMarks.toFixed(1)}%</p>
        <p><strong>High Performers (≥85%):</strong> ${highPerformers}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Name</th>
            <th>Tests</th>
            <th>Average</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `);
  }

  createAttendanceSummaryReportHtml(data: any): string {
    const students = data.value || data;
    const totalStudents = students.length;
    const totalPresent = students.reduce((sum: number, s: any) => sum + parseInt(s.presentDays || 0), 0);
    const totalAbsent = students.reduce((sum: number, s: any) => sum + parseInt(s.absentDays || 0), 0);
    const totalLate = students.reduce((sum: number, s: any) => sum + parseInt(s.lateDays || 0), 0);
    
    const rows = students.map((s: any) => `
      <tr>
        <td>${s.studentNumber}</td>
        <td>${s.userName}</td>
        <td>${s.totalDays}</td>
        <td class="present">${s.presentDays}</td>
        <td class="absent">${s.absentDays}</td>
        <td class="late">${s.lateDays}</td>
        <td><span class="marks-badge">${parseFloat(s.attendancePercentage).toFixed(1)}%</span></td>
      </tr>
    `).join('');

    return this.createReportTemplate('Attendance Summary Report', `
      <div class="summary-box">
        <h3>Period: ${this.reportDateFrom} to ${this.reportDateTo}</h3>
        <p><strong>Total Students:</strong> ${totalStudents}</p>
        <p><strong>Total Present:</strong> ${totalPresent} days</p>
        <p><strong>Total Absent:</strong> ${totalAbsent} days</p>
        <p><strong>Total Late:</strong> ${totalLate} days</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Student Name</th>
            <th>Total Days</th>
            <th>Present</th>
            <th>Absent</th>
            <th>Late</th>
            <th>Attendance %</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `);
  }

  createSubjectPerformanceReportHtml(subject: any): string {
    const studentsInSubject = this.allStudentGrades.filter(s => 
      s.subjectPerformance.some((sp: any) => sp.subject === subject.name)
    );

    if (studentsInSubject.length === 0) {
      return this.createReportTemplate(`${subject.name} - Performance Report`, `
        <div class="summary-box warning">
          <h3>Subject: ${subject.name}</h3>
          <p><strong>Type:</strong> ${subject.type}</p>
          <p><strong>Status:</strong> No student performance data available yet</p>
          <p>Students need to take tests in this subject before performance can be analyzed.</p>
        </div>
      `);
    }

    const totalTests = studentsInSubject.reduce((sum, s) => {
      const subjectData = s.subjectPerformance.find((sp: any) => sp.subject === subject.name);
      return sum + (subjectData?.totalTests || 0);
    }, 0);

    const avgMarks = studentsInSubject.reduce((sum, s) => {
      const subjectData = s.subjectPerformance.find((sp: any) => sp.subject === subject.name);
      return sum + (subjectData?.averageMarks || 0);
    }, 0) / studentsInSubject.length;

    const rows = studentsInSubject
      .sort((a, b) => {
        const aData = a.subjectPerformance.find((sp: any) => sp.subject === subject.name);
        const bData = b.subjectPerformance.find((sp: any) => sp.subject === subject.name);
        return (bData?.averageMarks || 0) - (aData?.averageMarks || 0);
      })
      .map((s, index) => {
        const subjectData = s.subjectPerformance.find((sp: any) => sp.subject === subject.name);
        const marks = subjectData?.averageMarks || 0;
        const grade = this.calculateGrade(marks);
        return `
          <tr>
            <td>${index + 1}</td>
            <td>${s.studentNumber}</td>
            <td>${s.name}</td>
            <td>${subjectData?.totalTests || 0}</td>
            <td><span class="marks-badge">${marks.toFixed(1)}%</span></td>
            <td><span class="grade-badge-${grade.replace('+', 'plus')}">${grade}</span></td>
          </tr>
        `;
      }).join('');

    return this.createReportTemplate(`${subject.name} - Performance Report`, `
      <div class="summary-box">
        <h3>Subject: ${subject.name}</h3>
        <p><strong>Type:</strong> ${subject.type}</p>
        <p><strong>Students with Data:</strong> ${studentsInSubject.length}</p>
        <p><strong>Total Tests Conducted:</strong> ${totalTests}</p>
        <p><strong>Subject Average:</strong> ${avgMarks.toFixed(1)}%</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Student ID</th>
            <th>Name</th>
            <th>Tests Taken</th>
            <th>Average</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `);
  }

  createTopPerformersReportHtml(topStudents: any[], gradeName: string): string {
    const rows = topStudents.map((s, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${s.studentNumber}</td>
        <td>${s.name}</td>
        <td>${s.grade || 'N/A'}</td>
        <td>${s.section || 'N/A'}</td>
        <td><span class="marks-badge">${s.averageMarks.toFixed(1)}%</span></td>
        <td><span class="grade-badge-${s.overallGrade.replace('+', 'plus')}">${s.overallGrade}</span></td>
        <td>${s.totalTests}</td>
      </tr>
    `).join('');

    return this.createReportTemplate('🏆 Top 10 Performers - ' + gradeName, `
      <div class="summary-box">
        <h3>Highest Achieving Students - ${gradeName}</h3>
        <p>Students with the highest overall average marks</p>
        <p><strong>Total Students in Report:</strong> ${topStudents.length}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Student ID</th>
            <th>Name</th>
            <th>Class</th>
            <th>Section</th>
            <th>Average</th>
            <th>Grade</th>
            <th>Tests</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `);
  }

  createLowPerformersReportHtml(students: any[], gradeName: string): string {
    const rows = students.map(s => `
      <tr>
        <td>${s.studentNumber}</td>
        <td>${s.name}</td>
        <td>${s.grade || 'N/A'}</td>
        <td>${s.section || 'N/A'}</td>
        <td><span class="marks-badge low">${s.averageMarks.toFixed(1)}%</span></td>
        <td>${s.totalTests}</td>
        <td>Needs additional support</td>
      </tr>
    `).join('');

    return this.createReportTemplate('⚠️ Students Needing Attention - ' + gradeName, `
      <div class="summary-box warning">
        <h3>Students with Average Below 70% - ${gradeName}</h3>
        <p><strong>Total:</strong> ${students.length} students</p>
        <p>These students may benefit from additional support and intervention</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Student ID</th>
            <th>Name</th>
            <th>Class</th>
            <th>Section</th>
            <th>Average</th>
            <th>Tests</th>
            <th>Recommendation</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `);
  }

  createClassSummaryReportHtml(): string {
    const avgMarks = this.allStudentGrades.reduce((sum, s) => sum + s.averageMarks, 0) / this.allStudentGrades.length || 0;
    const highPerformers = this.allStudentGrades.filter(s => s.averageMarks >= 85).length;
    const mediumPerformers = this.allStudentGrades.filter(s => s.averageMarks >= 70 && s.averageMarks < 85).length;
    const lowPerformers = this.allStudentGrades.filter(s => s.averageMarks < 70).length;

    return this.createReportTemplate('Class Summary Report', `
      <div class="summary-box">
        <h3>Overall Class Statistics</h3>
        <p><strong>Total Students:</strong> ${this.students.length}</p>
        <p><strong>Total Subjects:</strong> ${this.subjects.length}</p>
        <p><strong>Total Tests:</strong> ${this.tests.length}</p>
        <p><strong>Class Average:</strong> ${avgMarks.toFixed(1)}%</p>
      </div>

      <div class="summary-box">
        <h3>Performance Distribution</h3>
        <p><strong>High Performers (≥85%):</strong> ${highPerformers} students (${((highPerformers/this.allStudentGrades.length)*100).toFixed(1)}%)</p>
        <p><strong>Medium Performers (70-84%):</strong> ${mediumPerformers} students (${((mediumPerformers/this.allStudentGrades.length)*100).toFixed(1)}%)</p>
        <p><strong>Need Attention (<70%):</strong> ${lowPerformers} students (${((lowPerformers/this.allStudentGrades.length)*100).toFixed(1)}%)</p>
      </div>

      <div class="summary-box">
        <h3>Subject-wise Summary</h3>
        ${this.subjects.map(subj => `<p><strong>${subj.name}:</strong> ${subj.studentsCount || 0} students enrolled</p>`).join('')}
      </div>
    `);
  }

  createReportTemplate(title: string, content: string): string {
    const currentDate = new Date().toLocaleDateString();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5; }
          .container { max-width: 900px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #28a745; padding-bottom: 20px; }
          .header h1 { color: #28a745; margin: 0 0 10px 0; }
          .header p { color: #666; margin: 5px 0; }
          .summary-box { background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .summary-box.warning { background: #fff3f3; border: 2px solid #dc3545; }
          .summary-box h3 { color: #28a745; margin-top: 0; }
          .summary-box.warning h3 { color: #dc3545; }
          .summary-box p { margin: 8px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #28a745; color: white; padding: 12px; text-align: left; }
          td { padding: 12px; border-bottom: 1px solid #ddd; }
          tr:hover { background: #f8f9fa; }
          .marks-badge { display: inline-block; padding: 4px 12px; background: #28a745; color: white; border-radius: 12px; font-weight: 600; }
          .marks-badge.low { background: #dc3545; }
          .grade-badge-Aplus, .grade-badge-A { background: #d4edda; color: #155724; padding: 4px 12px; border-radius: 12px; font-weight: 600; }
          .grade-badge-Bplus, .grade-badge-B { background: #d1ecf1; color: #0c5460; padding: 4px 12px; border-radius: 12px; font-weight: 600; }
          .grade-badge-Cplus, .grade-badge-C { background: #fff3cd; color: #856404; padding: 4px 12px; border-radius: 12px; font-weight: 600; }
          .grade-badge-D { background: #ffe5d0; color: #bd4305; padding: 4px 12px; border-radius: 12px; font-weight: 600; }
          .grade-badge-F { background: #f8d7da; color: #721c24; padding: 4px 12px; border-radius: 12px; font-weight: 600; }
          .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 2px solid #ddd; color: #666; }
          @media print { body { padding: 20px; background: white; } .container { box-shadow: none; } }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title}</h1>
            <p><strong>Generated:</strong> ${currentDate}</p>
          </div>
          ${content}
          <div class="footer">
            <p>Student Performance Management System - Official Report</p>
            <p>Report Date: ${currentDate}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Grades & Marks Methods
  loadGrades() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Load all students and calculate their grades
    this.apiService.getStudents().subscribe({
      next: (response) => {
        const students = response.data || response;
        
        // For each student, calculate their overall performance
        Promise.all(students.map((student: any) => 
          this.calculateStudentGrade(student)
        )).then((gradesData: any[]) => {
          this.allStudentGrades = gradesData.filter(g => g !== null);
          this.applyGradesFilter();
          this.isLoading = false;
        });
      },
      error: (error) => {
        console.error('Error loading grades:', error);
        this.errorMessage = 'Failed to load grades';
        this.isLoading = false;
      }
    });
  }

  async calculateStudentGrade(student: any): Promise<any> {
    try {
      const performance = await this.apiService.getStudentPerformance(student.studentId).toPromise();
      
      return {
        id: student.studentId,
        name: student.user?.userName || 'Unknown',
        studentNumber: student.studentNumber,
        gradeId: student.gradeId,
        grade: student.grade_level?.gradeName || student.grade || 'N/A',
        section: student.section || 'N/A',
        totalTests: performance?.totalTests || 0,
        averageMarks: performance?.averageMarks || 0,
        overallGrade: this.calculateGrade(performance?.averageMarks || 0),
        subjectPerformance: performance?.subjectPerformance || []
      };
    } catch (error) {
      console.error(`Error loading performance for student ${student.studentId}:`, error);
      return null;
    }
  }

  calculateGrade(marks: number): string {
    if (marks >= 90) return 'A+';
    if (marks >= 85) return 'A';
    if (marks >= 80) return 'B+';
    if (marks >= 70) return 'B';
    if (marks >= 60) return 'C+';
    if (marks >= 50) return 'C';
    if (marks >= 40) return 'D';
    return 'F';
  }

  getGradeClass(grade: string): string {
    if (['A+', 'A'].includes(grade)) return 'grade-a';
    if (['B+', 'B'].includes(grade)) return 'grade-b';
    if (['C+', 'C'].includes(grade)) return 'grade-c';
    if (grade === 'D') return 'grade-d';
    return 'grade-f';
  }

  applyGradesFilter() {
    let filteredGrades = this.allStudentGrades;
    
    // Filter by grade/class first
    if (this.selectedGradeForAttendance) {
      filteredGrades = filteredGrades.filter((s: any) => s.gradeId == this.selectedGradeForAttendance);
      console.log(`📊 Filtered by grade ${this.selectedGradeForAttendance}: ${filteredGrades.length} students`);
    }
    
    // Then filter by performance level
    if (this.gradesFilter === 'all') {
      this.studentGrades = filteredGrades;
    } else if (this.gradesFilter === 'high') {
      this.studentGrades = filteredGrades.filter(s => s.averageMarks >= 85);
    } else if (this.gradesFilter === 'medium') {
      this.studentGrades = filteredGrades.filter(s => s.averageMarks >= 70 && s.averageMarks < 85);
    } else if (this.gradesFilter === 'low') {
      this.studentGrades = filteredGrades.filter(s => s.averageMarks < 70);
    }
    
    console.log(`✅ Final filtered list: ${this.studentGrades.length} students`);
  }

  viewStudentGrades(student: any) {
    // Show detailed breakdown by subject
    const subjectsBreakdown = student.subjectPerformance.map((sp: any) => 
      `${sp.subject}: ${sp.averageMarks}% (${sp.totalTests} tests)`
    ).join('\n');

    alert(`📊 Detailed Grades for ${student.name}\n\nOverall Average: ${student.averageMarks.toFixed(1)}%\nOverall Grade: ${student.overallGrade}\nTotal Tests: ${student.totalTests}\n\nSubject-wise Performance:\n${subjectsBreakdown || 'No subject data available'}`);
  }

  // Test Management Methods
  loadTests() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getTests().subscribe({
      next: (response) => {
        console.log('Tests loaded:', response);
        const tests = response.data || response;
        this.tests = tests.map((test: any) => ({
          id: test.testId,
          testType: test.testType,
          testMark: test.testMark,
          testDate: test.testDate,
          subjectId: test.subjectId,
          subjectName: test.subject?.subjectName || 'N/A',
          testDescription: test.exam?.testDescription || test.nonAcademicEvent?.eventDescription || '',
          teacherId: test.teacherId,
          teacherName: test.teacher?.userName || 'N/A',
          testClass: test.exam?.testClass || ''
        }));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tests:', error);
        this.errorMessage = 'Failed to load tests';
        this.isLoading = false;
      }
    });
  }

  openAddTestModal() {
    this.showAddTestModal = true;
    this.resetNewTestForm();
  }

  closeAddTestModal() {
    this.showAddTestModal = false;
    this.resetNewTestForm();
  }

  resetNewTestForm() {
    this.newTest = {
      testType: 1,
      testMark: '',
      testDate: new Date().toISOString().split('T')[0],
      subjectId: '',
      testDescription: '',
      testClass: ''
    };
  }

  addTest() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (!this.newTest.testDate || !this.newTest.subjectId) {
      alert('Please fill in required fields (Test Date and Subject)');
      return;
    }

    this.isLoading = true;

    const testData = {
      testType: parseInt(this.newTest.testType),
      testMark: this.newTest.testMark ? parseInt(this.newTest.testMark) : null,
      testDate: this.newTest.testDate,
      subjectId: parseInt(this.newTest.subjectId),
      teacherId: null, // Set to current teacher
      testClass: this.newTest.testClass ? parseInt(this.newTest.testClass) : null,
      testDescription: this.newTest.testDescription
    };

    this.apiService.createTest(testData).subscribe({
      next: (response) => {
        console.log('Test created:', response);
        this.loadTests();
        this.closeAddTestModal();
        this.isLoading = false;
        alert('Test created successfully!');
      },
      error: (error) => {
        console.error('Error creating test:', error);
        let errorMessage = 'Failed to create test. ';
        if (error.error && error.error.errors) {
          const errors = Object.values(error.error.errors).flat();
          errorMessage += errors.join(', ');
        } else if (error.error && error.error.message) {
          errorMessage += error.error.message;
        }
        alert(errorMessage);
        this.isLoading = false;
      }
    });
  }

  viewTestDetails(test: any) {
    this.selectedTest = test;
    this.showTestDetailsModal = true;
  }

  closeTestDetailsModal() {
    this.showTestDetailsModal = false;
    this.selectedTest = null;
  }

  editTest(test: any) {
    this.selectedTest = test;
    this.showEditTestModal = true;
    
    // Pre-fill the form with existing data
    this.editTestData = {
      testMark: test.testMark || '',
      testDate: test.testDate,
      subjectId: test.subjectId,
      testDescription: test.testDescription || '',
      testClass: test.testClass || ''
    };
  }

  closeEditTestModal() {
    this.showEditTestModal = false;
    this.selectedTest = null;
    this.resetEditTestForm();
  }

  resetEditTestForm() {
    this.editTestData = {
      testMark: '',
      testDate: '',
      subjectId: '',
      testDescription: '',
      testClass: ''
    };
  }

  updateTest() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (!this.editTestData.testDate) {
      alert('Test date is required');
      return;
    }

    this.isLoading = true;

    const testData = {
      testMark: this.editTestData.testMark ? parseInt(this.editTestData.testMark) : null,
      testDate: this.editTestData.testDate,
      testDescription: this.editTestData.testDescription
    };

    this.apiService.updateTest(this.selectedTest.id, testData).subscribe({
      next: (response) => {
        console.log('Test updated:', response);
        this.loadTests();
        this.closeEditTestModal();
        this.isLoading = false;
        alert('Test updated successfully!');
      },
      error: (error) => {
        console.error('Error updating test:', error);
        let errorMessage = 'Failed to update test. ';
        if (error.error && error.error.errors) {
          const errors = Object.values(error.error.errors).flat();
          errorMessage += errors.join(', ');
        } else if (error.error && error.error.message) {
          errorMessage += error.error.message;
        }
        alert(errorMessage);
        this.isLoading = false;
      }
    });
  }

  manageTestResults(test: any) {
    this.selectedTest = test;
    this.showManageTestResultsModal = true;
    this.loadTestResults(test.id);
  }

  closeManageTestResultsModal() {
    this.showManageTestResultsModal = false;
    this.selectedTest = null;
    this.testResults = [];
  }

  loadTestResults(testId: number) {
    this.isLoading = true;

    this.apiService.getTestResults(testId).subscribe({
      next: (response) => {
        console.log('Test results:', response);
        this.testResults = response || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading test results:', error);
        this.testResults = [];
        this.isLoading = false;
      }
    });
  }

  openAddResultModal() {
    this.showAddResultModal = true;
    this.resetNewResultForm();
  }

  closeAddResultModal() {
    this.showAddResultModal = false;
    this.resetNewResultForm();
  }

  resetNewResultForm() {
    this.newResult = {
      studentId: '',
      marksObtained: '',
      grade: '',
      remarks: ''
    };
  }

  addStudentResult() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (!this.newResult.studentId || !this.newResult.marksObtained) {
      alert('Please select a student and enter marks');
      return;
    }

    this.isLoading = true;

    const resultData = {
      studentId: parseInt(this.newResult.studentId),
      marksObtained: parseInt(this.newResult.marksObtained),
      grade: this.newResult.grade,
      remarks: this.newResult.remarks
    };

    this.apiService.addTestResult(this.selectedTest.id, resultData).subscribe({
      next: (response) => {
        console.log('Result added:', response);
        this.loadTestResults(this.selectedTest.id); // Reload results
        this.closeAddResultModal();
        this.isLoading = false;
        alert('Student result added successfully!');
      },
      error: (error) => {
        console.error('Error adding result:', error);
        let errorMessage = 'Failed to add result. ';
        if (error.error && error.error.errors) {
          const errors = Object.values(error.error.errors).flat();
          errorMessage += errors.join(', ');
        } else if (error.error && error.error.message) {
          errorMessage += error.error.message;
        }
        alert(errorMessage);
        this.isLoading = false;
      }
    });
  }

  // Subject Management Methods
  viewSubjectDetails(subject: any) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.selectedSubject = subject;
    this.showSubjectDetailsModal = true;
    this.loadSubjectFullDetails(subject.id);
  }

  loadSubjectFullDetails(subjectId: number) {
    this.isLoading = true;

    this.apiService.getSubjectDetails(subjectId).subscribe({
      next: (response) => {
        console.log('Subject details:', response);
        this.subjectDetails = response;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading subject details:', error);
        // Use basic info if API fails
        this.subjectDetails = this.selectedSubject;
        this.isLoading = false;
      }
    });
  }

  closeSubjectDetailsModal() {
    this.showSubjectDetailsModal = false;
    this.selectedSubject = null;
    this.subjectDetails = null;
  }

  editSubject(subject: any) {
    this.selectedSubject = subject;
    this.showEditSubjectModal = true;
    
    // Pre-fill the form
    this.editSubjectData = {
      subjectName: subject.name,
      subjectType: subject.type === 'Academic' ? 1 : 2,
      description: subject.description || ''
    };
  }

  closeEditSubjectModal() {
    this.showEditSubjectModal = false;
    this.selectedSubject = null;
    this.resetEditSubjectForm();
  }

  resetEditSubjectForm() {
    this.editSubjectData = {
      subjectName: '',
      subjectType: 1,
      description: ''
    };
  }

  updateSubject() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (!this.editSubjectData.subjectName) {
      alert('Please enter a subject name');
      return;
    }

    this.isLoading = true;

    const subjectData = {
      subjectName: this.editSubjectData.subjectName,
      subjectType: parseInt(this.editSubjectData.subjectType),
      description: this.editSubjectData.description
    };

    this.apiService.updateSubject(this.selectedSubject.id, subjectData).subscribe({
      next: (response) => {
        console.log('Subject updated:', response);
        this.loadSubjects();
        this.closeEditSubjectModal();
        this.isLoading = false;
        alert('Subject updated successfully!');
      },
      error: (error) => {
        console.error('Error updating subject:', error);
        let errorMessage = 'Failed to update subject. ';
        
        if (error.error && error.error.message) {
          errorMessage += error.error.message;
        } else if (error.error && error.error.errors) {
          const errors = Object.values(error.error.errors).flat();
          errorMessage += errors.join(', ');
        } else if (error.message) {
          errorMessage += error.message;
        }
        
        alert(errorMessage);
        this.isLoading = false;
      }
    });
  }

  manageSubject(subject: any) {
    this.selectedSubject = subject;
    this.showManageSubjectModal = true;
  }

  closeManageSubjectModal() {
    this.showManageSubjectModal = false;
    this.selectedSubject = null;
  }

  deleteSubject(subject: any) {
    if (!confirm(`Are you sure you want to delete "${subject.name}"? This action cannot be undone.`)) {
      return;
    }

    this.isLoading = true;

    this.apiService.deleteSubject(subject.id).subscribe({
      next: (response) => {
        console.log('Subject deleted:', response);
        this.loadSubjects();
        this.closeManageSubjectModal();
        this.isLoading = false;
        alert('Subject deleted successfully!');
      },
      error: (error) => {
        console.error('Error deleting subject:', error);
        alert('Failed to delete subject. Please try again.');
        this.isLoading = false;
      }
    });
  }

  loadAttendance() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    // Load students if not already loaded
    if (this.students.length === 0) {
      this.loadStudents();
    }

    // Create attendance records for today
    setTimeout(() => {
      let studentsToShow = this.students;
      
      // Filter by selected grade if one is selected
      if (this.selectedGradeForAttendance) {
        studentsToShow = studentsToShow.filter((s: any) => s.gradeId == this.selectedGradeForAttendance);
        console.log(`📊 Filtered to grade ${this.selectedGradeForAttendance}: ${studentsToShow.length} students`);
      }
      
      // Filter by selected section if one is selected
      if (this.selectedSectionForAttendance) {
        studentsToShow = studentsToShow.filter((s: any) => s.section === this.selectedSectionForAttendance);
        console.log(`📊 Filtered to section ${this.selectedSectionForAttendance}: ${studentsToShow.length} students`);
      }
      
      this.attendance = studentsToShow.map((student: any) => ({
        id: student.id,
        studentId: student.id,
        studentNumber: student.studentNumber,
        studentName: student.name,
        grade: student.grade,
        section: student.section,
        date: this.selectedDate,
        status: 'pending', // pending, present, absent, late
        remarks: ''
      }));
      
      console.log(`📅 Attendance list ready: ${this.attendance.length} students for ${this.selectedDate}`);
      this.isLoading = false;
    }, 300);
  }

  markAttendance(studentId: number, status: string) {
    const record = this.attendance.find(a => a.studentId === studentId);
    if (record) {
      // Capitalize first letter to match backend expectation
      record.status = status.charAt(0).toUpperCase() + status.slice(1);
      console.log(`Marked ${record.studentName} as ${record.status}`);
    }
  }

  saveAttendance() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const recordsToSave = this.attendance.filter(a => a.status !== 'pending');
    
    if (recordsToSave.length === 0) {
      alert('Please mark attendance for at least one student');
      return;
    }

    this.isLoading = true;

    // Prepare attendance data for API (backend expects 'attendance' array with subjectId)
    const attendanceData = {
      attendance: recordsToSave.map(record => ({
        studentId: record.studentId,
        subjectId: 1, // Default subject (you can make this dynamic later)
        attendanceDate: this.selectedDate,
        status: record.status,
        remarks: record.remarks || '',
        teacherId: this.teacherId // Set to current teacher's ID
      }))
    };
    
    console.log('💾 Saving attendance with teacherId:', this.teacherId);
    console.log('📝 Attendance data:', attendanceData);

    // Call API to save attendance
    this.apiService.saveAttendance(attendanceData).subscribe({
      next: (response) => {
        console.log('Attendance saved:', response);
        const created = response.created || 0;
        const updated = response.updated || 0;
        alert(`Attendance saved successfully!\n✅ Created: ${created}\n🔄 Updated: ${updated}`);
        this.isLoading = false;
        this.loadAttendance(); // Reload to show saved data
      },
      error: (error) => {
        console.error('Error saving attendance:', error);
        let errorMessage = 'Failed to save attendance. ';
        
        if (error.error && error.error.message) {
          errorMessage += error.error.message;
        } else if (error.message) {
          errorMessage += error.message;
        }
        
        alert(errorMessage);
        this.isLoading = false;
      }
    });
  }

  onDateChange() {
    this.loadAttendance();
  }

  clearAttendanceFilters() {
    this.selectedGradeForAttendance = '';
    this.selectedSectionForAttendance = '';
    this.loadAttendance();
  }

  generateAttendanceReport() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isLoading = true;

    // Fetch attendance data from database by date
    this.apiService.getAttendanceByDate(this.selectedDate).subscribe({
      next: (response) => {
        console.log('Attendance report data:', response);
        
        if (!response.records || response.records.length === 0) {
          this.isLoading = false;
          alert('No attendance records found for this date in the database');
          return;
        }

        // Prepare data for report
        const reportData = {
          date: this.selectedDate,
          records: response.records.map((r: any) => ({
            studentNumber: r.student?.studentNumber || 'N/A',
            studentName: r.student?.user?.userName || 'Unknown',
            status: r.status,
            remarks: r.remarks || '',
            subject: r.subject?.subjectName || 'N/A'
          })),
          statistics: response.statistics
        };

        const reportHtml = this.generateAttendanceReportHtml(reportData);
        const reportWindow = window.open('', '_blank', 'width=900,height=700');
        
        if (reportWindow) {
          reportWindow.document.write(reportHtml);
          reportWindow.document.close();
          
          setTimeout(() => {
            reportWindow.print();
          }, 500);
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching attendance report:', error);
        alert('Failed to fetch attendance data from database. Please try again.');
        this.isLoading = false;
      }
    });
  }

  generateAttendanceReportHtml(data: any): string {
    const reportDate = new Date(data.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const currentDate = new Date().toLocaleDateString();
    
    const presentCount = data.statistics.present;
    const absentCount = data.statistics.absent;
    const lateCount = data.statistics.late;
    const total = data.statistics.total;
    const attendanceRate = data.statistics.attendanceRate;

    const tableRows = data.records.map((record: any) => `
      <tr class="${record.status.toLowerCase()}">
        <td>${record.studentNumber}</td>
        <td>${record.studentName}</td>
        <td>${record.subject}</td>
        <td>
          <span class="status-badge ${record.status.toLowerCase()}">
            ${record.status === 'Present' ? '✓' : record.status === 'Absent' ? '✗' : '⏰'} 
            ${record.status}
          </span>
        </td>
        <td>${record.remarks || '-'}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Attendance Report - ${this.selectedDate}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5; }
          .container { max-width: 900px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #28a745; padding-bottom: 20px; }
          .header h1 { color: #28a745; margin: 0 0 10px 0; }
          .header p { color: #666; margin: 5px 0; }
          .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 30px 0; }
          .summary-card { padding: 20px; border-radius: 8px; text-align: center; }
          .summary-card.present { background: #d4edda; border: 2px solid #28a745; }
          .summary-card.absent { background: #f8d7da; border: 2px solid #dc3545; }
          .summary-card.late { background: #fff3cd; border: 2px solid #ffc107; }
          .summary-card.total { background: #d1ecf1; border: 2px solid #17a2b8; }
          .summary-card h3 { margin: 0 0 10px 0; font-size: 36px; font-weight: bold; }
          .summary-card.present h3 { color: #155724; }
          .summary-card.absent h3 { color: #721c24; }
          .summary-card.late h3 { color: #856404; }
          .summary-card.total h3 { color: #0c5460; }
          .summary-card p { margin: 0; font-size: 14px; font-weight: 600; text-transform: uppercase; color: #666; }
          table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          th { background: #28a745; color: white; padding: 12px; text-align: left; font-weight: 600; }
          td { padding: 12px; border-bottom: 1px solid #ddd; }
          tr:hover { background: #f8f9fa; }
          tr.present { background: #f0fff4; }
          tr.absent { background: #fff5f5; }
          tr.late { background: #fffbf0; }
          .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-weight: 600; font-size: 13px; }
          .status-badge.present { background: #d4edda; color: #155724; }
          .status-badge.absent { background: #f8d7da; color: #721c24; }
          .status-badge.late { background: #fff3cd; color: #856404; }
          .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 2px solid #ddd; color: #666; font-size: 14px; }
          .attendance-rate { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .attendance-rate h2 { margin: 0 0 10px 0; font-size: 48px; }
          .attendance-rate p { margin: 0; font-size: 18px; }
          @media print {
            body { padding: 20px; background: white; }
            .container { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Daily Attendance Report</h1>
            <p><strong>Date:</strong> ${reportDate}</p>
            <p><strong>Report Generated:</strong> ${currentDate}</p>
          </div>

          <div class="attendance-rate">
            <h2>${attendanceRate}%</h2>
            <p>Overall Attendance Rate</p>
          </div>

          <div class="summary">
            <div class="summary-card present">
              <h3>${presentCount}</h3>
              <p>Present</p>
            </div>
            <div class="summary-card absent">
              <h3>${absentCount}</h3>
              <p>Absent</p>
            </div>
            <div class="summary-card late">
              <h3>${lateCount}</h3>
              <p>Late</p>
            </div>
            <div class="summary-card total">
              <h3>${total}</h3>
              <p>Total Students</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Student Name</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div class="footer">
            <p><strong>Summary:</strong> ${presentCount} Present, ${absentCount} Absent, ${lateCount} Late out of ${total} students</p>
            <p>This is an official attendance report generated by the Student Performance Management System</p>
            <p>Report Date: ${currentDate}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Getter methods for stats
  get presentCount(): number {
    return this.attendance.filter(a => a.status === 'Present').length;
  }

  get absentCount(): number {
    return this.attendance.filter(a => a.status === 'Absent').length;
  }

  get lateCount(): number {
    return this.attendance.filter(a => a.status === 'Late').length;
  }

  get lowPerformersCount(): number {
    return this.studentGrades.filter(s => s.averageMarks < 70).length;
  }

  // Edit Student Methods
  openEditStudentModal(student: any) {
    this.selectedStudent = student;
    this.showEditStudentModal = true;
    
    // Pre-fill the form with existing data
    this.editStudent = {
      userName: student.name,
      userEmail: student.email,
      userContact: student.contact || '',
      studentNumber: student.studentNumber,
      dateOfBirth: student.dateOfBirth || '',
      enrollmentDate: student.enrollmentDate || ''
    };
  }

  closeEditStudentModal() {
    this.showEditStudentModal = false;
    this.selectedStudent = null;
    this.resetEditStudentForm();
  }

  resetEditStudentForm() {
    this.editStudent = {
      userName: '',
      userEmail: '',
      userContact: '',
      studentNumber: '',
      dateOfBirth: '',
      enrollmentDate: ''
    };
  }

  updateStudentInfo() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Validate required fields
    if (!this.editStudent.userName || !this.editStudent.userEmail || !this.editStudent.studentNumber) {
      alert('Please fill in all required fields');
      return;
    }

    this.isLoading = true;

    // Prepare data for API
    const studentData = {
      userName: this.editStudent.userName,
      userEmail: this.editStudent.userEmail,
      userContact: this.editStudent.userContact,
      studentNumber: this.editStudent.studentNumber,
      dateOfBirth: this.editStudent.dateOfBirth,
      enrollmentDate: this.editStudent.enrollmentDate
    };

    // Call API to update student
    this.apiService.updateStudent(this.selectedStudent.id, studentData).subscribe({
      next: (response) => {
        console.log('Student updated:', response);
        this.loadStudents(); // Reload the list
        this.closeEditStudentModal();
        this.isLoading = false;
        alert('Student updated successfully!');
      },
      error: (error) => {
        console.error('Error updating student:', error);
        let errorMessage = 'Failed to update student. ';
        
        if (error.error && error.error.message) {
          errorMessage += error.error.message;
        } else if (error.error && error.error.errors) {
          const errors = Object.values(error.error.errors).flat();
          errorMessage += errors.join(', ');
        } else if (error.message) {
          errorMessage += error.message;
        }
        
        alert(errorMessage);
        this.isLoading = false;
      }
    });
  }

  // Generate Student Report
  generateStudentReport(student: any) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.isLoading = true;

    // Fetch comprehensive student report
    this.apiService.getStudentReport(student.id).subscribe({
      next: (response) => {
        console.log('Student report:', response);
        this.isLoading = false;
        
        // Open report in new window or download as PDF
        this.openReportWindow(response, student);
      },
      error: (error) => {
        console.error('Error generating report:', error);
        this.isLoading = false;
        alert('Failed to generate report. Please try again.');
      }
    });
  }

  openReportWindow(reportData: any, student: any) {
    // Create HTML content for the report
    const reportHtml = this.generateReportHtml(reportData, student);
    
    // Open in new window
    const reportWindow = window.open('', '_blank', 'width=800,height=600');
    if (reportWindow) {
      reportWindow.document.write(reportHtml);
      reportWindow.document.close();
      
      // Trigger print dialog after a short delay
      setTimeout(() => {
        reportWindow.print();
      }, 500);
    }
  }

  generateReportHtml(data: any, student: any): string {
    const currentDate = new Date().toLocaleDateString();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Student Report - ${student.name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #28a745; padding-bottom: 20px; }
          .header h1 { color: #28a745; margin: 0; }
          .header p { color: #666; margin: 5px 0; }
          .section { margin: 30px 0; }
          .section h2 { color: #333; border-bottom: 2px solid #ddd; padding-bottom: 10px; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .info-item { padding: 10px; background: #f8f9fa; border-left: 3px solid #28a745; }
          .info-label { font-weight: bold; color: #666; font-size: 12px; }
          .info-value { color: #333; font-size: 14px; margin-top: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #28a745; color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #ddd; }
          tr:hover { background: #f8f9fa; }
          .summary-box { background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .summary-box h3 { color: #28a745; margin-top: 0; }
          .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 2px solid #ddd; color: #666; }
          @media print {
            .no-print { display: none; }
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🎓 Student Performance Report</h1>
          <p><strong>Student:</strong> ${student.name}</p>
          <p><strong>Student Number:</strong> ${student.studentNumber}</p>
          <p><strong>Report Generated:</strong> ${currentDate}</p>
        </div>

        <div class="section">
          <h2>📋 Student Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Full Name</div>
              <div class="info-value">${student.name}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Student Number</div>
              <div class="info-value">${student.studentNumber}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Email</div>
              <div class="info-value">${student.email}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Parent/Guardian</div>
              <div class="info-value">${student.parentName || 'Not Assigned'}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2>📊 Academic Summary</h2>
          <div class="summary-box">
            <h3>Performance Overview</h3>
            <p><strong>Total Tests:</strong> ${data.summary?.totalTests || 0}</p>
            <p><strong>Average Marks:</strong> ${data.summary?.averageMarks || 0}%</p>
            <p><strong>Highest Mark:</strong> ${data.summary?.highestMark || 0}%</p>
            <p><strong>Lowest Mark:</strong> ${data.summary?.lowestMark || 0}%</p>
          </div>
        </div>

        ${this.generateTestResultsTable(data.testResults)}
        ${this.generateAttendanceSection(data.attendance)}

        <div class="footer">
          <p>This is an official report generated by the Student Performance Management System</p>
          <p>Report Date: ${currentDate}</p>
        </div>
      </body>
      </html>
    `;
  }

  generateTestResultsTable(testResults: any[]): string {
    if (!testResults || testResults.length === 0) {
      return `
        <div class="section">
          <h2>📝 Test Results</h2>
          <p>No test results available.</p>
        </div>
      `;
    }

    const rows = testResults.map(result => `
      <tr>
        <td>${result.test?.subject?.subjectName || 'N/A'}</td>
        <td>${result.test?.testDate || 'N/A'}</td>
        <td>${result.marksObtained}%</td>
        <td>${result.grade || 'N/A'}</td>
        <td>${result.remarks || '-'}</td>
      </tr>
    `).join('');

    return `
      <div class="section">
        <h2>📝 Test Results</h2>
        <table>
          <thead>
            <tr>
              <th>Subject</th>
              <th>Test Date</th>
              <th>Marks</th>
              <th>Grade</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  }

  generateAttendanceSection(attendance: any[]): string {
    if (!attendance || attendance.length === 0) {
      return `
        <div class="section">
          <h2>📅 Attendance Record</h2>
          <p>No attendance records available.</p>
        </div>
      `;
    }

    const presentCount = attendance.filter(a => a.status === 'Present').length;
    const absentCount = attendance.filter(a => a.status === 'Absent').length;
    const lateCount = attendance.filter(a => a.status === 'Late').length;
    const total = attendance.length;
    const attendanceRate = total > 0 ? ((presentCount / total) * 100).toFixed(1) : 0;

    return `
      <div class="section">
        <h2>📅 Attendance Record</h2>
        <div class="summary-box">
          <h3>Attendance Summary</h3>
          <p><strong>Total Days:</strong> ${total}</p>
          <p><strong>Present:</strong> ${presentCount} days</p>
          <p><strong>Absent:</strong> ${absentCount} days</p>
          <p><strong>Late:</strong> ${lateCount} days</p>
          <p><strong>Attendance Rate:</strong> ${attendanceRate}%</p>
        </div>
      </div>
    `;
  }

  // Student Details Methods
  viewStudentDetails(student: any) {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.selectedStudent = student;
    this.showStudentDetailsModal = true;
    this.loadStudentDetails(student.id);
  }

  loadStudentDetails(studentId: number) {
    this.isLoading = true;

    this.apiService.getStudent(studentId).subscribe({
      next: (response) => {
        console.log('Student details:', response);
        this.studentDetails = {
          ...response,
          id: response.studentId,
          name: response.user?.userName || 'Unknown',
          email: response.user?.userEmail || '',
          contact: response.user?.userContact || 'N/A',
          studentNumber: response.studentNumber,
          dateOfBirth: response.dateOfBirth || 'N/A',
          enrollmentDate: response.enrollmentDate || 'N/A',
          parentName: response.parent?.userName || 'Not Assigned',
          parentEmail: response.parent?.userEmail || 'N/A',
          parentContact: response.parent?.userContact || 'N/A',
          testResults: response.test_results || response.testResults || [],
          attendance: response.attendance || []
        };
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading student details:', error);
        let errorMessage = 'Failed to load student details. ';
        if (error.error && error.error.message) {
          errorMessage += error.error.message;
        } else if (error.message) {
          errorMessage += error.message;
        }
        console.error('Full error:', error);
        alert(errorMessage);
        this.isLoading = false;
      }
    });
  }

  closeStudentDetailsModal() {
    this.showStudentDetailsModal = false;
    this.studentDetails = null;
    this.selectedStudent = null;
  }

  // Getter methods for student attendance stats
  get studentPresentCount(): number {
    return this.studentDetails?.attendance?.filter((a: any) => a.status === 'Present').length || 0;
  }

  get studentAbsentCount(): number {
    return this.studentDetails?.attendance?.filter((a: any) => a.status === 'Absent').length || 0;
  }

  get studentLateCount(): number {
    return this.studentDetails?.attendance?.filter((a: any) => a.status === 'Late').length || 0;
  }

  // Parent Management Methods
  openAssignParentModal(student: any) {
    this.selectedStudent = student;
    this.showAssignParentModal = true;
    this.parentModalTab = 'create';
    this.resetNewParentForm();
    this.loadAvailableParents();
  }

  closeAssignParentModal() {
    this.showAssignParentModal = false;
    this.selectedStudent = null;
    this.resetNewParentForm();
  }

  resetNewParentForm() {
    this.newParent = {
      userName: '',
      password: '',
      userEmail: '',
      userContact: '',
      occupation: ''
    };
  }

  loadAvailableParents() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.apiService.getParents().subscribe({
      next: (response) => {
        console.log('Parents loaded:', response);
        // Filter parents that don't have a student assigned
        this.availableParents = response.data?.filter((parent: any) => !parent.studentId) || [];
      },
      error: (error) => {
        console.error('Error loading parents:', error);
        this.availableParents = [];
      }
    });
  }

  createAndAssignParent() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Validate form
    if (!this.newParent.userName || !this.newParent.password || !this.newParent.userEmail) {
      alert('Please fill in all required fields');
      return;
    }

    this.isLoading = true;

    // Prepare data for API
    const parentData = {
      userName: this.newParent.userName,
      password: this.newParent.password,
      userEmail: this.newParent.userEmail,
      userContact: this.newParent.userContact,
      occupation: this.newParent.occupation,
      studentId: this.selectedStudent.id
    };

    // Call API to create parent
    this.apiService.createParent(parentData).subscribe({
      next: (response) => {
        console.log('Parent created:', response);
        this.loadStudents(); // Reload the list
        this.closeAssignParentModal();
        this.isLoading = false;
        alert('Parent created and assigned successfully!');
      },
      error: (error) => {
        console.error('Error creating parent:', error);
        let errorMessage = 'Failed to create parent. ';
        
        if (error.error && error.error.message) {
          errorMessage += error.error.message;
        } else if (error.error && error.error.errors) {
          const errors = Object.values(error.error.errors).flat();
          errorMessage += errors.join(', ');
        } else if (error.message) {
          errorMessage += error.message;
        }
        
        alert(errorMessage);
        this.isLoading = false;
      }
    });
  }

  assignExistingParent(parent: any) {
    if (!isPlatformBrowser(this.platformId) || !this.selectedStudent) {
      return;
    }

    this.isLoading = true;

    this.apiService.updateStudentParent(this.selectedStudent.id, parent.userId).subscribe({
      next: (response) => {
        console.log('Parent assigned:', response);
        this.loadStudents(); // Reload the list
        this.closeAssignParentModal();
        this.isLoading = false;
        alert('Parent assigned successfully!');
      },
      error: (error) => {
        console.error('Error assigning parent:', error);
        alert('Failed to assign parent. Please try again.');
        this.isLoading = false;
      }
    });
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
      sessionStorage.removeItem('currentUser');
    }
    this.router.navigate(['/login']);
  }

  // Student filtering methods
  applyStudentFilters() {
    this.filteredStudents = this.students.filter(student => {
      // Filter by grade
      if (this.studentFilters.grade && student.gradeId != this.studentFilters.grade) {
        return false;
      }

      // Filter by section
      if (this.studentFilters.section && student.section !== this.studentFilters.section) {
        return false;
      }

      // Filter by status
      if (this.studentFilters.status && student.status !== this.studentFilters.status) {
        return false;
      }

      // Filter by search term (name, email, student number)
      if (this.studentFilters.searchTerm) {
        const searchLower = this.studentFilters.searchTerm.toLowerCase();
        return student.name.toLowerCase().includes(searchLower) ||
               student.email.toLowerCase().includes(searchLower) ||
               student.studentNumber.toLowerCase().includes(searchLower);
      }

      return true;
    });
  }

  onStudentFilterChange() {
    this.applyStudentFilters();
  }

  clearStudentFilters() {
    this.studentFilters = {
      grade: '',
      section: '',
      status: '',
      searchTerm: ''
    };
    this.applyStudentFilters();
  }

  getFilteredStudentCount(): number {
    return this.filteredStudents.length;
  }
}
