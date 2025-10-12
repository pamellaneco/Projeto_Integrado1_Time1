import { app } from "electron";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const setupDB = () => {
  // Get the directory path reserved for the application on file system.
  // Ex: "c:\Users\<user>\AppData\Roaming\turnus" on Windows.
  // Reference: https://www.electronjs.org/docs/latest/api/app#appgetpathname
  const userDataPath = app.getPath('userData');

  // Create the directory if not exists.
  if (!fs.existsSync(userDataPath))
    fs.mkdirSync(userDataPath, { recursive: true });

  // SQLite works with files for storing records.
  // The line below creates the path for such file.
  const dbPath = path.join(userDataPath, 'app.sqlite');

  // Create database instance based on file of file-system.
  // If the file does not exist, It is created.
  return new Database(dbPath);
}

export const db = setupDB();