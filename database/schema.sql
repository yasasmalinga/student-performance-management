-- Student Performance Management System Database Schema
-- Based on UML Class Diagram

-- Create database
CREATE DATABASE IF NOT EXISTS student_performance_db;
USE student_performance_db;

-- Users table (Base class for all user types)
CREATE TABLE users (
    userId INT PRIMARY KEY AUTO_INCREMENT,
    userName VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    userType INT NOT NULL, -- 1: Admin, 2: Teacher, 3: Student, 4: Parent
    userEmail VARCHAR(100) UNIQUE NOT NULL,
    userContact VARCHAR(20),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Subjects table
CREATE TABLE subjects (
    subjectId INT PRIMARY KEY AUTO_INCREMENT,
    subjectName VARCHAR(100) NOT NULL,
    subjectType INT NOT NULL, -- 1: Academic, 2: Non-Academic
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tests table (Base class for Exam and Non-Academic)
CREATE TABLE tests (
    testId INT PRIMARY KEY AUTO_INCREMENT,
    testType INT NOT NULL, -- 1: Exam, 2: Non-Academic
    testMark INT,
    testDate DATE NOT NULL,
    subjectRank INT,
    subjectId INT,
    teacherId INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (subjectId) REFERENCES subjects(subjectId),
    FOREIGN KEY (teacherId) REFERENCES users(userId)
);

-- Exams table (inherits from Tests)
CREATE TABLE exams (
    examId INT PRIMARY KEY AUTO_INCREMENT,
    testId INT NOT NULL,
    testClass INT NOT NULL,
    testDescription TEXT,
    FOREIGN KEY (testId) REFERENCES tests(testId) ON DELETE CASCADE
);

-- Non-Academic events table (inherits from Tests)
CREATE TABLE non_academic (
    nonAcademicId INT PRIMARY KEY AUTO_INCREMENT,
    testId INT NOT NULL,
    eventType INT NOT NULL,
    eventDate DATE NOT NULL,
    rank INT,
    eventDescription TEXT,
    eventLevel VARCHAR(50),
    FOREIGN KEY (testId) REFERENCES tests(testId) ON DELETE CASCADE
);

-- Students table (inherits from Users)
CREATE TABLE students (
    studentId INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    parentId INT,
    studentNumber VARCHAR(20) UNIQUE,
    dateOfBirth DATE,
    enrollmentDate DATE,
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
    FOREIGN KEY (parentId) REFERENCES users(userId)
);

-- Parents table (inherits from Users)
CREATE TABLE parents (
    parentId INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    studentId INT,
    occupation VARCHAR(100),
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE,
    FOREIGN KEY (studentId) REFERENCES students(studentId)
);

-- Teachers table (inherits from Users)
CREATE TABLE teachers (
    teacherId INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    employeeNumber VARCHAR(20) UNIQUE,
    department VARCHAR(100),
    specialization VARCHAR(100),
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

-- Admins table (inherits from Users)
CREATE TABLE admins (
    adminId INT PRIMARY KEY AUTO_INCREMENT,
    userId INT NOT NULL,
    adminLevel INT DEFAULT 1, -- 1: Super Admin, 2: Admin
    FOREIGN KEY (userId) REFERENCES users(userId) ON DELETE CASCADE
);

-- Student Test Results (Many-to-Many relationship)
CREATE TABLE student_test_results (
    resultId INT PRIMARY KEY AUTO_INCREMENT,
    studentId INT NOT NULL,
    testId INT NOT NULL,
    marksObtained INT,
    grade VARCHAR(5),
    remarks TEXT,
    FOREIGN KEY (studentId) REFERENCES students(studentId) ON DELETE CASCADE,
    FOREIGN KEY (testId) REFERENCES tests(testId) ON DELETE CASCADE,
    UNIQUE KEY unique_student_test (studentId, testId)
);

-- Notifications table
CREATE TABLE notifications (
    notificationId INT PRIMARY KEY AUTO_INCREMENT,
    subjectId INT,
    studentId INT,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    notificationType INT NOT NULL, -- 1: Academic, 2: Non-Academic, 3: General
    isRead BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (subjectId) REFERENCES subjects(subjectId),
    FOREIGN KEY (studentId) REFERENCES students(studentId)
);

-- Attendance table
CREATE TABLE attendance (
    attendanceId INT PRIMARY KEY AUTO_INCREMENT,
    studentId INT NOT NULL,
    subjectId INT NOT NULL,
    attendanceDate DATE NOT NULL,
    status ENUM('Present', 'Absent', 'Late', 'Excused') DEFAULT 'Present',
    remarks TEXT,
    teacherId INT,
    FOREIGN KEY (studentId) REFERENCES students(studentId) ON DELETE CASCADE,
    FOREIGN KEY (subjectId) REFERENCES subjects(subjectId),
    FOREIGN KEY (teacherId) REFERENCES users(userId),
    UNIQUE KEY unique_student_subject_date (studentId, subjectId, attendanceDate)
);

-- Teacher-Subject assignments (Many-to-Many relationship)
CREATE TABLE teacher_subjects (
    assignmentId INT PRIMARY KEY AUTO_INCREMENT,
    teacherId INT NOT NULL,
    subjectId INT NOT NULL,
    assignedDate DATE DEFAULT (CURRENT_DATE),
    FOREIGN KEY (teacherId) REFERENCES users(userId) ON DELETE CASCADE,
    FOREIGN KEY (subjectId) REFERENCES subjects(subjectId) ON DELETE CASCADE,
    UNIQUE KEY unique_teacher_subject (teacherId, subjectId)
);

-- Insert sample data
INSERT INTO users (userName, password, userType, userEmail, userContact) VALUES
('admin', 'admin123', 1, 'admin@school.com', '1234567890'),
('john_teacher', 'teacher123', 2, 'john.teacher@school.com', '1234567891'),
('jane_student', 'student123', 3, 'jane.student@school.com', '1234567892'),
('bob_parent', 'parent123', 4, 'bob.parent@school.com', '1234567893');

INSERT INTO subjects (subjectName, subjectType, description) VALUES
('Mathematics', 1, 'Core mathematics curriculum'),
('English Literature', 1, 'English language and literature'),
('Science', 1, 'General science subjects'),
('Sports', 2, 'Physical education and sports activities'),
('Music', 2, 'Music and arts education');

INSERT INTO teachers (userId, employeeNumber, department, specialization) VALUES
(2, 'T001', 'Mathematics', 'Advanced Mathematics');

INSERT INTO students (userId, studentNumber, dateOfBirth, enrollmentDate) VALUES
(3, 'S001', '2010-05-15', '2023-09-01');

INSERT INTO parents (userId, occupation) VALUES
(4, 'Engineer');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(userEmail);
CREATE INDEX idx_users_type ON users(userType);
CREATE INDEX idx_tests_date ON tests(testDate);
CREATE INDEX idx_tests_type ON tests(testType);
CREATE INDEX idx_notifications_student ON notifications(studentId);
CREATE INDEX idx_attendance_student_date ON attendance(studentId, attendanceDate);
CREATE INDEX idx_student_results_student ON student_test_results(studentId);
