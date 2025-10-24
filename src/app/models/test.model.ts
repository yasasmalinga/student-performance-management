export interface Subject {
  subjectId: number;
  subjectName: string;
  subjectType: number; // 1: Academic, 2: Non-Academic
  description?: string;
  createdAt?: Date;
}

export interface Tests {
  testId: number;
  testType: number; // 1: Exam, 2: Non-Academic
  testMark: number;
  testDate: Date;
  subjectRank?: number;
  subjectId: number;
  teacherId: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Exam extends Tests {
  examId: number;
  testClass: number;
  testDescription?: string;
}

export interface NonAcademic extends Tests {
  nonAcademicId: number;
  eventType: number;
  eventDate: Date;
  rank?: number;
  eventDescription?: string;
  eventLevel?: string;
}

export interface StudentTestResult {
  resultId: number;
  studentId: number;
  testId: number;
  marksObtained: number;
  grade?: string;
  remarks?: string;
}

export interface Notification {
  notificationId: number;
  subjectId?: number;
  studentId?: number;
  title: string;
  message: string;
  notificationType: number; // 1: Academic, 2: Non-Academic, 3: General
  isRead: boolean;
  createdAt: Date;
}

export interface Attendance {
  attendanceId: number;
  studentId: number;
  subjectId: number;
  attendanceDate: Date;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  remarks?: string;
  teacherId: number;
}

export interface TeacherSubject {
  assignmentId: number;
  teacherId: number;
  subjectId: number;
  assignedDate: Date;
}
