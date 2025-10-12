import { app } from 'electron';
import path from 'path';
import fs from "node:fs";
import { readFile } from 'fs/promises';
import Database from "better-sqlite3";
import { migrateDB } from './migrate.js';

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

  // Delete existing database file.
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

  // Re-initialize database file.
  const db = new Database(dbPath);
  migrateDB(db);
}

try {
  await resetDB();
} finally {
  app.quit();
}