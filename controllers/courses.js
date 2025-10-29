import db from "../db/database.js";

/**
 * Create a new course
 * @param {Object} course - Course object with name, current_module, link
 * @returns {Object} - Created course with id
 * @throws {Error} - If name is missing
 */
export function createCourse(course) {
  if (!course.name) {
    throw new Error("Course must have a name field");
  }

  const stmt = db.prepare(
    "INSERT INTO courses (name, current_module, link) VALUES (?, ?, ?)"
  );
  const result = stmt.run(course.name, course.current_module || null, course.link || null);

  return {
    id: result.lastInsertRowid,
    name: course.name,
    current_module: course.current_module || null,
    link: course.link || null,
  };
}

/**
 * Get a single course by ID
 * @param {number} id - Course ID
 * @returns {Object|null} - Course object or null if not found
 */
export function getCourse(id) {
  const stmt = db.prepare("SELECT * FROM courses WHERE id = ?");
  return stmt.get(id) || null;
}

/**
 * Get all courses
 * @returns {Array} - Array of all courses
 */
export function getAllCourses() {
  const stmt = db.prepare("SELECT * FROM courses");
  return stmt.all();
}

/**
 * Update a course
 * @param {number} id - Course ID
 * @param {Object} updates - Fields to update (name, current_module, link)
 * @returns {Object|null} - Updated course or null if not found
 */
export function updateCourse(id, updates) {
  // Check if course exists
  const existing = getCourse(id);
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
  if (updates.current_module !== undefined) {
    fields.push("current_module = ?");
    values.push(updates.current_module);
  }
  if (updates.link !== undefined) {
    fields.push("link = ?");
    values.push(updates.link);
  }

  if (fields.length === 0) {
    return existing; // No updates provided
  }

  values.push(id);
  const query = `UPDATE courses SET ${fields.join(", ")} WHERE id = ?`;
  const stmt = db.prepare(query);
  stmt.run(...values);

  return getCourse(id);
}

/**
 * Delete a course
 * @param {number} id - Course ID
 * @returns {boolean} - True if deleted, false if not found
 */
export function deleteCourse(id) {
  const existing = getCourse(id);
  if (!existing) {
    return false;
  }

  const stmt = db.prepare("DELETE FROM courses WHERE id = ?");
  stmt.run(id);
  return true;
}
