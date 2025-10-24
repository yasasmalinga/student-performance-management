import { Injectable } from '@angular/core';
import { User, Admin, Teacher, Student, Parent } from '../models/user.model';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private mysql: any;

  constructor(private databaseService: DatabaseService) {
    this.initializeMySQL();
  }

  private async initializeMySQL() {
    this.mysql = await import('mysql2/promise');
  }

  // User methods from UML diagram
  async login(userName: string, password: string): Promise<User | null> {
    try {
      const connection = await this.mysql.createConnection(this.databaseService.getConnectionConfig());
      
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE userName = ? AND password = ?',
        [userName, password]
      );
      
      await connection.end();
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  async logout(): Promise<boolean> {
    // In a real application, you might invalidate tokens here
    return true;
  }

  async editUser(userId: number, userData: Partial<User>): Promise<boolean> {
    try {
      const connection = await this.mysql.createConnection(this.databaseService.getConnectionConfig());
      
      const fields = Object.keys(userData).map(key => `${key} = ?`).join(', ');
      const values = Object.values(userData);
      values.push(userId);
      
      await connection.execute(
        `UPDATE users SET ${fields} WHERE userId = ?`,
        values
      );
      
      await connection.end();
      return true;
    } catch (error) {
      console.error('Edit user error:', error);
      return false;
    }
  }

  async searchUser(searchTerm: string): Promise<User[]> {
    try {
      const connection = await this.mysql.createConnection(this.databaseService.getConnectionConfig());
      
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE userName LIKE ? OR userEmail LIKE ?',
        [`%${searchTerm}%`, `%${searchTerm}%`]
      );
      
      await connection.end();
      return rows;
    } catch (error) {
      console.error('Search user error:', error);
      return [];
    }
  }

  async viewUser(userId: number): Promise<User | null> {
    try {
      const connection = await this.mysql.createConnection(this.databaseService.getConnectionConfig());
      
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE userId = ?',
        [userId]
      );
      
      await connection.end();
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('View user error:', error);
      return null;
    }
  }

  // Admin methods from UML diagram
  async createUser(userData: User): Promise<boolean> {
    try {
      const connection = await this.mysql.createConnection(this.databaseService.getConnectionConfig());
      
      await connection.execute(
        'INSERT INTO users (userName, password, userType, userEmail, userContact) VALUES (?, ?, ?, ?, ?)',
        [userData.userName, userData.password, userData.userType, userData.userEmail, userData.userContact]
      );
      
      await connection.end();
      return true;
    } catch (error) {
      console.error('Create user error:', error);
      return false;
    }
  }

  async deleteUser(userId: number): Promise<boolean> {
    try {
      const connection = await this.mysql.createConnection(this.databaseService.getConnectionConfig());
      
      await connection.execute(
        'DELETE FROM users WHERE userId = ?',
        [userId]
      );
      
      await connection.end();
      return true;
    } catch (error) {
      console.error('Delete user error:', error);
      return false;
    }
  }

  async viewPerformance(): Promise<any[]> {
    try {
      const connection = await this.mysql.createConnection(this.databaseService.getConnectionConfig());
      
      const [rows] = await connection.execute(`
        SELECT 
          s.studentNumber,
          u.userName,
          u.userEmail,
          AVG(str.marksObtained) as averageMarks,
          COUNT(str.testId) as totalTests
        FROM students s
        JOIN users u ON s.userId = u.userId
        LEFT JOIN student_test_results str ON s.studentId = str.studentId
        GROUP BY s.studentId
      `);
      
      await connection.end();
      return rows;
    } catch (error) {
      console.error('View performance error:', error);
      return [];
    }
  }

  // Teacher methods from UML diagram
  async addTestMarks(testData: any): Promise<boolean> {
    try {
      const connection = await this.mysql.createConnection(this.databaseService.getConnectionConfig());
      
      await connection.execute(
        'INSERT INTO student_test_results (studentId, testId, marksObtained, grade, remarks) VALUES (?, ?, ?, ?, ?)',
        [testData.studentId, testData.testId, testData.marksObtained, testData.grade, testData.remarks]
      );
      
      await connection.end();
      return true;
    } catch (error) {
      console.error('Add test marks error:', error);
      return false;
    }
  }

  async editTestMarks(resultId: number, marksData: any): Promise<boolean> {
    try {
      const connection = await this.mysql.createConnection(this.databaseService.getConnectionConfig());
      
      await connection.execute(
        'UPDATE student_test_results SET marksObtained = ?, grade = ?, remarks = ? WHERE resultId = ?',
        [marksData.marksObtained, marksData.grade, marksData.remarks, resultId]
      );
      
      await connection.end();
      return true;
    } catch (error) {
      console.error('Edit test marks error:', error);
      return false;
    }
  }

  async addAttendance(attendanceData: any): Promise<boolean> {
    try {
      const connection = await this.mysql.createConnection(this.databaseService.getConnectionConfig());
      
      await connection.execute(
        'INSERT INTO attendance (studentId, subjectId, attendanceDate, status, remarks, teacherId) VALUES (?, ?, ?, ?, ?, ?)',
        [attendanceData.studentId, attendanceData.subjectId, attendanceData.attendanceDate, attendanceData.status, attendanceData.remarks, attendanceData.teacherId]
      );
      
      await connection.end();
      return true;
    } catch (error) {
      console.error('Add attendance error:', error);
      return false;
    }
  }

  async editAttendance(attendanceId: number, attendanceData: any): Promise<boolean> {
    try {
      const connection = await this.mysql.createConnection(this.databaseService.getConnectionConfig());
      
      await connection.execute(
        'UPDATE attendance SET status = ?, remarks = ? WHERE attendanceId = ?',
        [attendanceData.status, attendanceData.remarks, attendanceId]
      );
      
      await connection.end();
      return true;
    } catch (error) {
      console.error('Edit attendance error:', error);
      return false;
    }
  }

  async deleteAttendance(attendanceId: number): Promise<boolean> {
    try {
      const connection = await this.mysql.createConnection(this.databaseService.getConnectionConfig());
      
      await connection.execute(
        'DELETE FROM attendance WHERE attendanceId = ?',
        [attendanceId]
      );
      
      await connection.end();
      return true;
    } catch (error) {
      console.error('Delete attendance error:', error);
      return false;
    }
  }

  async generateReport(studentId?: number): Promise<any[]> {
    try {
      const connection = await this.mysql.createConnection(this.databaseService.getConnectionConfig());
      
      let query = `
        SELECT 
          s.studentNumber,
          u.userName,
          sub.subjectName,
          t.testDate,
          str.marksObtained,
          str.grade,
          a.status as attendanceStatus
        FROM students s
        JOIN users u ON s.userId = u.userId
        LEFT JOIN student_test_results str ON s.studentId = str.studentId
        LEFT JOIN tests t ON str.testId = t.testId
        LEFT JOIN subjects sub ON t.subjectId = sub.subjectId
        LEFT JOIN attendance a ON s.studentId = a.studentId AND sub.subjectId = a.subjectId
      `;
      
      const params = [];
      if (studentId) {
        query += ' WHERE s.studentId = ?';
        params.push(studentId);
      }
      
      query += ' ORDER BY t.testDate DESC';
      
      const [rows] = await connection.execute(query, params);
      await connection.end();
      return rows;
    } catch (error) {
      console.error('Generate report error:', error);
      return [];
    }
  }
}
