import { Injectable } from '@angular/core';
import { databaseConfig } from '../config/database.config';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private config = databaseConfig;

  constructor() { }

  getConnectionConfig() {
    return {
      host: this.config.host,
      user: this.config.user,
      password: this.config.password,
      database: this.config.database,
      port: this.config.port,
      connectionLimit: this.config.connectionLimit,
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true
    };
  }

  // Test database connection
  async testConnection(): Promise<boolean> {
    try {
      const mysql = await import('mysql2/promise');
      const connection = await mysql.createConnection(this.getConnectionConfig());
      await connection.ping();
      await connection.end();
      return true;
    } catch (error) {
      console.error('Database connection failed:', error);
      return false;
    }
  }
}
