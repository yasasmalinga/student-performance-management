import { Injectable } from '@angular/core';
import { Tests, Exam, NonAcademic, Subject, StudentTestResult } from '../models/test.model';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root'
})
export class TestService {
  private mysql: any;

  constructor(private databaseService: DatabaseService) {
    this.initializeMySQL();
  }

  private async initializeMySQL() {
    this.mysql = await import('mysql2/promise');
  }

  // Test methods from UML diagram
  async addTest(testData: Tests): Promise<boolean> {
    try {
      const connection = await this.mysql.createConnection(this.databaseService.getConnectionConfig());
      
      const [result] = await connection.execute(
        'INSERT INTO tests (testType, testMark, testDate, subjectRank, subjectId, teacherId) VALUES (?, ?, ?, ?, ?, ?)',
        [testData.testType, testData.testMark, testData.testDate, testData.subjectRank, testData.subjectId, testData.teacherId]
      );
      
      await connection.end();
      return true;
    } catch (error) {
      console.error('Add test error:', error);
      return false;
    }
  }

  async updateTest(testId: number, testData: Partial<Tests>): Promise<boolean> {
    try {
      const connection = await this.mysql.createConnection(this.databaseService.getConnectionConfig());
      
      const fields = Object.keys(testData).map(key => `${key} = ?`).join(', ');
      const values = Object.values(testData);
      values.push(testId);
      
      await connection.execute(
        `UPDATE tests SET ${fields} WHERE testId = ?`,
        values
      );
      
      await connection.end();
      return true;
    } catch (error) {
      console.error('Update test error:', error);
      return false;
    }
  }

  async deleteTest(testId: number): Promise<boolean> {
    try {
      const connection = await this.mysql.createConnection(this.databaseService.getConnectionConfig());
      
      await connection.execute(
        'DELETE FROM tests WHERE testId = ?',
        [testId]
      );
      
      await connection.end();
      return true;
    } catch (error) {
      console.error('Delete test error:', error);
      return false;
    }
  }

  async searchTest(searchTerm: string): Promise<Tests[]> {
    try {
      const connection = await this.mysql.createConnection(this.databaseService.getConnectionConfig());
      
      const [rows] = await connection.execute(`
        SELECT t.*, s.subjectName 
        FROM tests t 
        JOIN subjects s ON t.subjectId = s.subjectId 
        WHERE s.subjectName LIKE ? OR t.testDate LIKE ?
      `, [`%${searchTerm}%`, `%${searchTerm}%`]);
      
      await connection.end();
      return rows;
    } catch (error) {
      console.error('Search test error:', error);
      return [];
    }
  }

  // Get all subjects
  async getSubjects(): Promise<Subject[]> {
    try {
      const connection = await this.mysql.createConnection(this.databaseService.getConnectionConfig());
      
      const [rows] = await connection.execute('SELECT * FROM subjects ORDER BY subjectName');
      
      await connection.end();
      return rows;
    } catch (error) {
      console.error('Get subjects error:', error);
      return [];
    }
  }

  // Get tests by student
  async getTestsByStudent(studentId: number): Promise<any[]> {
    try {
      const connection = await this.mysql.createConnection(this.databaseService.getConnectionConfig());
      
      const [rows] = await connection.execute(`
        SELECT 
          t.*,
          s.subjectName,
          str.marksObtained,
          str.grade,
          str.remarks
        FROM tests t
        JOIN subjects s ON t.subjectId = s.subjectId
        LEFT JOIN student_test_results str ON t.testId = str.testId AND str.studentId = ?
        ORDER BY t.testDate DESC
      `, [studentId]);
      
      await connection.end();
      return rows;
    } catch (error) {
      console.error('Get tests by student error:', error);
      return [];
    }
  }

  // Get student performance summary
  async getStudentPerformance(studentId: number): Promise<any> {
    try {
      const connection = await this.mysql.createConnection(this.databaseService.getConnectionConfig());
      
      const [rows] = await connection.execute(`
        SELECT 
          AVG(str.marksObtained) as averageMarks,
          COUNT(str.testId) as totalTests,
          MAX(str.marksObtained) as highestMarks,
          MIN(str.marksObtained) as lowestMarks
        FROM student_test_results str
        WHERE str.studentId = ?
      `, [studentId]);
      
      await connection.end();
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Get student performance error:', error);
      return null;
    }
  }
}
