import path, { join } from "node:path";
import process from "node:process";
import fs from "node:fs";

export const migrateDB = (db) => {
  try {
    const migrationsDir = join(process.cwd(), 'database', 'migrations')
    const currentVersion = db.pragma('user_version', { simple: true })

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort() // order by prefix code

    files.forEach(file => {
      const version = parseInt(file.split('_')[0]) // ex: 001_init.sql -> 1

      if (version > currentVersion) {
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
        console.log(`Applying migration ${file}`);
        db.exec(sql);
        db.pragma(`user_version = ${version}`);
      }
    });

    console.log("Database migration successfully completed.");
  } catch (error) {
    console.error(`Error on applying migration: ${JSON.stringify(error)}`);
    console.log("It might be necessary reseting the database.");
  }
}
