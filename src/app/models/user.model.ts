export interface User {
  userId: number;
  userName: string;
  password: string;
  userType: number; // 1: Admin, 2: Teacher, 3: Student, 4: Parent
  userEmail: string;
  userContact: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Admin extends User {
  adminId: number;
  adminLevel: number; // 1: Super Admin, 2: Admin
}

export interface Teacher extends User {
  teacherId: number;
  employeeNumber: string;
  department: string;
  specialization: string;
}

export interface Student extends User {
  studentId: number;
  parentId?: number;
  studentNumber: string;
  dateOfBirth: Date;
  enrollmentDate: Date;
}

export interface Parent extends User {
  parentId: number;
  studentId?: number;
  occupation: string;
}
