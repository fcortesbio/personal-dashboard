import Database from "better-sqlite3";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

// find the /data directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = path.join(__dirname, "..", "data");

// ensure the /data directory exists before trying to create the DB
if (!fs.existsSync(dbDir)) {
  try {
    fs.mkdirSync(dbDir, { recursive: true });
  } catch (err) {
    console.error("Error creating directory:", err);
  }
}

// 1. Initialize the database
const dbPath = path.join(dbDir, "dashboard.db");
const db = new Database(dbPath, { verbose: console.log });

// 2. Enable WAL mode for better performance
db.pragma("journal_mode = WAL");

// 3. Create a function to run table set up
function createTables() {
  // Use .exec() for multiple statements or set up commands
  db.exec(
    `CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      current_module TEXT,
      link TEXT
    );

    CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      link TEXT NOT NULL
    );
    `,
  );
}

// Run setup immediately
try {
  createTables();
  console.log(`Connected to the SQLite database at ${dbPath}`);
} catch (err) {
  console.error("Error connecting to SQLite: ", err);
}

export default db;
