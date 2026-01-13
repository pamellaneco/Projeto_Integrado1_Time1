import { app } from 'electron';
import path from 'path';
import fs from "node:fs";
import { readFile } from 'fs/promises';
import { migrateDB } from './migrate.js';
import { seedDB } from './seed.js';
import { DatabaseManager } from './database-manager.js';

// Standalone reseting script, should not be exported.
const resetDB = async () => {
  const pkg = JSON.parse(
    await readFile(new URL('../../package.json', import.meta.url))
  );

  app.setName(pkg.name);
  const userDataPath = app.getPath('userData');

  if (!fs.existsSync(userDataPath)) {
    throw new Error("Application directory not initialized.");
  }

  // Get file path.
  const dbPath = path.join(userDataPath, 'app.sqlite');

  // Fecha a conexão existente do Singleton (se houver)
  DatabaseManager.close();

  // Delete existing database file.
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

  // Re-initialize database file using Singleton pattern
  const db = DatabaseManager.getInstance();
  migrateDB(db);
  seedDB(db);
}

try {
  await resetDB();
} finally {
  app.quit();
}