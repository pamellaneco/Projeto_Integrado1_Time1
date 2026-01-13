import { app } from "electron";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

/**
 * Singleton com instância única do banco de dados SQLite.
 */
export class DatabaseManager {
  static instance = null;

  constructor() {
    const userDataPath = app.getPath('userData');

    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }

    const dbPath = path.join(userDataPath, 'app.sqlite');
    this.database = new Database(dbPath);
  }

  static getInstance() {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance.database;
  }

  static close() {
    if (DatabaseManager.instance) {
      DatabaseManager.instance.database.close();
      DatabaseManager.instance = null;
    }
  }

  static reset() {
    if (DatabaseManager.instance) {
      DatabaseManager.instance.database.close();
      DatabaseManager.instance = null;
    }
  }
}
