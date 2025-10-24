export interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
  connectionLimit: number;
}

export const databaseConfig: DatabaseConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // Add your MySQL password here
  database: 'student_performance_db',
  port: 3306,
  connectionLimit: 10
};
