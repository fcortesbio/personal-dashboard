import Database from "better-sqlite3";

/**
 * Create an isolated in-memory test database
 * Each test run gets a fresh database with no data persistence
 */
function createTestDatabase() {
  // Use in-memory database for tests - isolated and fast
  const db = new Database(":memory:");

  // Enable WAL mode for consistency with production
  db.pragma("journal_mode = WAL");

  // Create tables
  db.exec(
    `CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      current_module TEXT,
      link TEXT
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      link TEXT
    );
    `,
  );

  return db;
}

export default createTestDatabase;
