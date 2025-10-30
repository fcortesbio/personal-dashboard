import dbDefault from "../db/database.js";

/**
 * Create a new bookmark
 * @param {Object} bookmark - Bookmark object with name, link
 * @param {Database} [db] - Optional database instance (for testing)
 * @returns {Object} - Created bookmark with id
 * @throws {Error} - If name is missing
 */
export function createBookmark(bookmark, db = dbDefault) {
  if (!bookmark.name) {
    throw new Error("Bookmark must have a name field");
  }

  const stmt = db.prepare("INSERT INTO bookmarks (name, link) VALUES (?, ?)");
  const result = stmt.run(bookmark.name, bookmark.link || null);

  return {
    id: result.lastInsertRowid,
    name: bookmark.name,
    link: bookmark.link || null,
  };
}

/**
 * Get a single bookmark by ID
 * @param {number} id - Bookmark ID
 * @param {Database} [db] - Optional database instance (for testing)
 * @returns {Object|null} - Bookmark object or null if not found
 */
export function getBookmark(id, db = dbDefault) {
  const stmt = db.prepare("SELECT * FROM bookmarks WHERE id = ?");
  return stmt.get(id) || null;
}

/**
 * Get all bookmarks
 * @param {Database} [db] - Optional database instance (for testing)
 * @returns {Array} - Array of all bookmarks
 */
export function getAllBookmarks(db = dbDefault) {
  const stmt = db.prepare("SELECT * FROM bookmarks");
  return stmt.all();
}

/**
 * Update a bookmark
 * @param {number} id - Bookmark ID
 * @param {Object} updates - Fields to update (name, link)
 * @param {Database} [db] - Optional database instance (for testing)
 * @returns {Object|null} - Updated bookmark or null if not found
 */
export function updateBookmark(id, updates, db = dbDefault) {
  // Check if bookmark exists
  const existing = getBookmark(id, db);
  if (!existing) {
    return null;
  }

  // Build dynamic UPDATE query based on provided fields
  const fields = [];
  const values = [];

  if (updates.name !== undefined) {
    fields.push("name = ?");
    values.push(updates.name);
  }
  if (updates.link !== undefined) {
    fields.push("link = ?");
    values.push(updates.link);
  }

  if (fields.length === 0) {
    return existing; // No updates provided
  }

  values.push(id);
  const query = `UPDATE bookmarks SET ${fields.join(", ")} WHERE id = ?`;
  const stmt = db.prepare(query);
  stmt.run(...values);

  return getBookmark(id, db);
}

/**
 * Delete a bookmark
 * @param {number} id - Bookmark ID
 * @param {Database} [db] - Optional database instance (for testing)
 * @returns {boolean} - True if deleted, false if not found
 */
export function deleteBookmark(id, db = dbDefault) {
  const existing = getBookmark(id, db);
  if (!existing) {
    return false;
  }

  const stmt = db.prepare("DELETE FROM bookmarks WHERE id = ?");
  stmt.run(id);
  return true;
}
