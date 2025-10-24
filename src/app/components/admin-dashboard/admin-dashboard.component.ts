import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
  providers: [ApiService]
})
export class AdminDashboardComponent implements OnInit {
  // User info
  adminName: string = 'Admin';
  
  // Statistics
  totalStudents: number = 0;
  totalTeachers: number = 0;
  totalParents: number = 0;
  totalSubjects: number = 0;
  totalTests: number = 0;
  totalAttendanceRecords: number = 0;
  
  // Averages
  studentsAttendanceAvg: number = 0;
  studentsProgressAvg: number = 0;
  
  // Lists
  studentsList: any[] = [];
  teachersList: any[] = [];
  parentsList: any[] = [];
  filteredParentsList: any[] = [];
  subjectsList: any[] = [];
  
  // Loading state
  isLoading: boolean = true;
  
  // Parent filtering
  parentFilters = {
    searchTerm: '',
    occupation: '',
    hasStudent: ''
  };
  
  // Parent detail and edit properties
  selectedParent: any = null;
  showParentDetailModal = false;
  showEditParentModal = false;
  showAssignStudentModal = false;
  studentsWithoutParents: any[] = [];
  editParentForm: any = {};
  assignStudentForm: any = {};
  
  // Active view
  activeView: string = 'dashboard';
  
  // Form states
  showAddTeacherForm: boolean = false;
  showAddParentForm: boolean = false;
  newTeacher = {
    userName: '',
    userEmail: '',
    userContact: '',
    password: 'teacher123',
    employeeNumber: '',
    department: '',
    specialization: ''
  };
  newParent = {
    userName: '',
    userEmail: '',
    userContact: '',
    password: 'parent123',
    occupation: '',
    studentId: null
  };

  constructor(
    private apiService: ApiService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.loadAdminName();
    this.loadDashboardData();
  }

  loadAdminName() {
    if (isPlatformBrowser(this.platformId)) {
      const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      if (userStr) {
        const user = JSON.parse(userStr);
        this.adminName = user.userName || 'Admin';
      }
    }
  }

  loadDashboardData() {
    this.isLoading = true;
    
    // Load all statistics from database
    this.loadStudentsCount();
    this.loadTeachersCount();
    this.loadParentsCount();
    this.loadSubjectsCount();
    this.loadTestsCount();
    this.loadAttendanceStats();
    this.loadStudentPerformanceAvg();
  }

  loadStudentsCount() {
    this.apiService.getStudents().subscribe({
      next: (response) => {
        this.studentsList = response.data || response;
        this.totalStudents = response.total || this.studentsList.length || 0;
        console.log('📊 Total Students:', this.totalStudents);
      },
      error: (error) => {
        console.error('Error loading students count:', error);
        this.totalStudents = 0;
        this.studentsList = [];
      }
    });
  }

  loadTeachersCount() {
    this.apiService.getUsers().subscribe({
      next: (response) => {
        // Handle paginated response
        const users = response.data || response;
        // UserType 2 = Teacher
        this.teachersList = users.filter((u: any) => u.userType === 2);
        this.totalTeachers = this.teachersList.length;
        console.log('👨‍🏫 Total Teachers:', this.totalTeachers);
      },
      error: (error) => {
        console.error('Error loading teachers count:', error);
        this.totalTeachers = 0;
        this.teachersList = [];
      }
    });
  }

  loadParentsCount() {
    this.apiService.getParents().subscribe({
      next: (response) => {
        // Handle paginated response - data is in response.data
        const parents = response.data || response;
        this.parentsList = parents;
        this.filteredParentsList = parents;
        this.totalParents = parents.length || 0;
        console.log('👨‍👩‍👧 Total Parents:', this.totalParents);
        console.log('👨‍👩‍👧 Parents data:', parents);
      },
      error: (error) => {
        console.error('Error loading parents count:', error);
        this.totalParents = 0;
        this.parentsList = [];
        this.filteredParentsList = [];
      }
    });
  }

  loadSubjectsCount() {
    this.apiService.getSubjects().subscribe({
      next: (subjects) => {
        this.subjectsList = subjects;
        this.totalSubjects = subjects.length || 0;
        console.log('📚 Total Subjects:', this.totalSubjects);
      },
      error: (error) => {
        console.error('Error loading subjects count:', error);
        this.totalSubjects = 0;
        this.subjectsList = [];
      }
    });
  }

  loadTestsCount() {
    this.apiService.getTests().subscribe({
      next: (tests) => {
        this.totalTests = tests.length || 0;
        console.log('📝 Total Tests:', this.totalTests);
      },
      error: (error) => {
        console.error('Error loading tests count:', error);
        this.totalTests = 0;
      }
    });
  }

  loadAttendanceStats() {
    this.apiService.getAttendance().subscribe({
      next: (response) => {
        // Handle paginated response
        const attendance = response.data || response;
        const total = response.total || attendance.length || 0;
        
        this.totalAttendanceRecords = total;
        
        // Calculate attendance average
        if (attendance.length > 0) {
          const presentCount = attendance.filter((a: any) => a.status === 'Present').length;
          this.studentsAttendanceAvg = (presentCount / attendance.length) * 100;
        }
        
        console.log('📅 Total Attendance Records:', this.totalAttendanceRecords);
        console.log('📊 Attendance Average:', this.studentsAttendanceAvg.toFixed(2) + '%');
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading attendance:', error);
        this.totalAttendanceRecords = 0;
        this.studentsAttendanceAvg = 0;
        this.isLoading = false;
      }
    });
  }

  loadStudentPerformanceAvg() {
    // Get all students and their performance
    this.apiService.getStudents().subscribe({
      next: (response) => {
        const students = response.data || response;
        
        if (students.length > 0) {
          let totalPerformance = 0;
          let studentsWithResults = 0;
          
          // For simplicity, we'll just set a placeholder
          // In a real app, you'd need to fetch each student's report and average them
          students.forEach((student: any) => {
            // This is a simplified version - you'd normally fetch actual performance data
            totalPerformance += Math.random() * 100; // Placeholder
            studentsWithResults++;
          });
          
          if (studentsWithResults > 0) {
            this.studentsProgressAvg = totalPerformance / studentsWithResults;
          }
        }
        
        console.log('📈 Student Progress Average:', this.studentsProgressAvg.toFixed(2) + '%');
      },
      error: (error) => {
        console.error('Error loading student performance:', error);
        this.studentsProgressAvg = 0;
      }
    });
  }

  switchView(view: string) {
    console.log('🔄 Switching to view:', view);
    this.activeView = view;
  }

  toggleAddTeacherForm() {
    this.showAddTeacherForm = !this.showAddTeacherForm;
    if (!this.showAddTeacherForm) {
      this.resetTeacherForm();
    }
  }

  resetTeacherForm() {
    this.newTeacher = {
      userName: '',
      userEmail: '',
      userContact: '',
      password: 'teacher123',
      employeeNumber: '',
      department: '',
      specialization: ''
    };
  }

  addTeacher() {
    if (!this.newTeacher.userName || !this.newTeacher.userEmail || 
        !this.newTeacher.employeeNumber || !this.newTeacher.department) {
      alert('Please fill in all required fields!');
      return;
    }

    console.log('➕ Adding new teacher:', this.newTeacher);

    this.apiService.createTeacher(this.newTeacher).subscribe({
      next: (response) => {
        console.log('✅ Teacher created successfully:', response);
        alert('Teacher added successfully!');
        this.showAddTeacherForm = false;
        this.resetTeacherForm();
        // Reload teachers list
        this.loadTeachersCount();
      },
      error: (error) => {
        console.error('❌ Error creating teacher:', error);
        const errorMsg = error.error?.message || error.error?.errors || 'Failed to create teacher';
        alert('Error: ' + JSON.stringify(errorMsg));
      }
    });
  }

  toggleAddParentForm() {
    this.showAddParentForm = !this.showAddParentForm;
    if (!this.showAddParentForm) {
      this.resetParentForm();
    }
  }

  resetParentForm() {
    this.newParent = {
      userName: '',
      userEmail: '',
      userContact: '',
      password: 'parent123',
      occupation: '',
      studentId: null
    };
  }

  addParent() {
    if (!this.newParent.userName || !this.newParent.userEmail || !this.newParent.userContact) {
      alert('Please fill in all required fields!');
      return;
    }

    console.log('➕ Adding new parent:', this.newParent);

    this.apiService.createParent(this.newParent).subscribe({
      next: (response) => {
        console.log('✅ Parent created successfully:', response);
        alert('Parent/Guardian added successfully!');
        this.showAddParentForm = false;
        this.resetParentForm();
        // Reload parents list
        this.loadParentsCount();
      },
      error: (error) => {
        console.error('❌ Error creating parent:', error);
        const errorMsg = error.error?.message || error.error?.errors || 'Failed to create parent';
        alert('Error: ' + JSON.stringify(errorMsg));
      }
    });
  }

  // Parent filtering methods
  applyParentFilters() {
    this.filteredParentsList = this.parentsList.filter(parent => {
      // Filter by search term (name, email, contact)
      if (this.parentFilters.searchTerm) {
        const searchLower = this.parentFilters.searchTerm.toLowerCase();
        const matchesSearch = 
          parent.user?.userName?.toLowerCase().includes(searchLower) ||
          parent.user?.userEmail?.toLowerCase().includes(searchLower) ||
          parent.user?.userContact?.toLowerCase().includes(searchLower) ||
          parent.occupation?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // Filter by occupation
      if (this.parentFilters.occupation) {
        if (parent.occupation !== this.parentFilters.occupation) return false;
      }

      // Filter by student assignment
      if (this.parentFilters.hasStudent === 'yes') {
        if (!parent.student) return false;
      } else if (this.parentFilters.hasStudent === 'no') {
        if (parent.student) return false;
      }

      return true;
    });
  }

  onParentFilterChange() {
    this.applyParentFilters();
  }

  clearParentFilters() {
    this.parentFilters = {
      searchTerm: '',
      occupation: '',
      hasStudent: ''
    };
    this.applyParentFilters();
  }

  getFilteredParentCount(): number {
    return this.filteredParentsList.length;
  }

  getUniqueOccupations(): string[] {
    const occupations = this.parentsList
      .map(parent => parent.occupation)
      .filter(occupation => occupation && occupation.trim() !== '')
      .filter((occupation, index, self) => self.indexOf(occupation) === index);
    return occupations.sort();
  }

  // Parent detail and management methods
  viewParent(parent: any) {
    this.selectedParent = parent;
    this.showParentDetailModal = true;
  }

  editParent(parent: any) {
    this.selectedParent = parent;
    this.editParentForm = {
      userName: parent.user.userName,
      userEmail: parent.user.userEmail,
      userContact: parent.user.userContact,
      occupation: parent.occupation || '',
      password: '' // Leave empty for optional password update
    };
    this.showEditParentModal = true;
  }

  assignStudentToParent(parent: any) {
    this.selectedParent = parent;
    this.assignStudentForm = {
      studentId: null
    };
    this.loadStudentsWithoutParents();
    this.showAssignStudentModal = true;
  }

  loadStudentsWithoutParents() {
    this.apiService.getStudentsWithoutParents().subscribe({
      next: (students) => {
        this.studentsWithoutParents = students;
        console.log('📚 Students without parents:', this.studentsWithoutParents.length);
      },
      error: (error) => {
        console.error('❌ Error loading students without parents:', error);
        this.studentsWithoutParents = [];
      }
    });
  }

  saveParentEdit() {
    if (!this.selectedParent) return;

    // Only include fields that have values
    const updateData: any = {};
    if (this.editParentForm.userName) updateData.userName = this.editParentForm.userName;
    if (this.editParentForm.userEmail) updateData.userEmail = this.editParentForm.userEmail;
    if (this.editParentForm.userContact) updateData.userContact = this.editParentForm.userContact;
    if (this.editParentForm.occupation) updateData.occupation = this.editParentForm.occupation;
    if (this.editParentForm.password) updateData.password = this.editParentForm.password;

    this.apiService.updateParent(this.selectedParent.parentId, updateData).subscribe({
      next: (response) => {
        console.log('✅ Parent updated successfully:', response);
        alert('Parent updated successfully!');
        this.showEditParentModal = false;
        this.loadParentsCount(); // Reload parents list
      },
      error: (error) => {
        console.error('❌ Error updating parent:', error);
        const errorMsg = error.error?.message || error.error?.errors || 'Failed to update parent';
        alert('Error: ' + JSON.stringify(errorMsg));
      }
    });
  }

  saveStudentAssignment() {
    if (!this.selectedParent || !this.assignStudentForm.studentId) return;

    this.apiService.assignStudentToParent(this.selectedParent.parentId, this.assignStudentForm.studentId).subscribe({
      next: (response) => {
        console.log('✅ Student assigned to parent successfully:', response);
        alert('Student assigned to parent successfully!');
        this.showAssignStudentModal = false;
        this.loadParentsCount(); // Reload parents list
      },
      error: (error) => {
        console.error('❌ Error assigning student to parent:', error);
        const errorMsg = error.error?.message || error.error?.errors || 'Failed to assign student to parent';
        alert('Error: ' + JSON.stringify(errorMsg));
      }
    });
  }

  closeParentModals() {
    this.showParentDetailModal = false;
    this.showEditParentModal = false;
    this.showAssignStudentModal = false;
    this.selectedParent = null;
    this.editParentForm = {};
    this.assignStudentForm = {};
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
      sessionStorage.removeItem('currentUser');
    }
    this.router.navigate(['/login']);
  }
}
