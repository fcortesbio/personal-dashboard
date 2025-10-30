import createTestDatabase from "../db/test-database.js";
import {
  createCourse as createCourseController,
  getCourse as getCourseController,
  getAllCourses as getAllCoursesController,
  updateCourse as updateCourseController,
  deleteCourse as deleteCourseController,
} from "../controllers/courses.js";

// Create isolated test database
const db = createTestDatabase();

// Wrap controller functions to use test database
const createCourse = (course) => createCourseController(course, db);
const getCourse = (id) => getCourseController(id, db);
const getAllCourses = () => getAllCoursesController(db);
const updateCourse = (id, updates) => updateCourseController(id, updates, db);
const deleteCourse = (id) => deleteCourseController(id, db);

// test helper
const assert = (condition, message) => {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
};

const assertEquals = (actual, expected, message) => {
  if (actual !== expected) {
    throw new Error(`Expected ${expected}, got ${actual}. ${message}`);
  }
};

const test = (name, fn) => {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (err) {
    console.error(`✗ ${name}`);
    console.error(`  ${err.message}`);
    process.exit(1);
  }
};

// No setup/teardown needed - fresh database for each test run
function setup() {
  // Database is already empty (in-memory)
}

function teardown() {
  // No need to clear - database is destroyed after tests
  db.close();
}

// ===== TESTS =====

console.log("ℹ  Using isolated in-memory test database (production data safe)\n");

setup();

test("CREATE: should insert a new course", () => {
  const course = {
    name: "Amazon Junior Software Developer with GenAI",
    current_module: "Exploring conditional statements",
    link: "https://www.coursera.org/learn/introduction-to-software-development/lecture/GJXyy/exploring-conditional-statements",
  };

  const result = createCourse(course);
  assert(result.id > 0, "Course ID should be greater than 0");
  assertEquals(result.name, course.name, "Course name should match");
});

test("CREATE: should require name field", () => {
  const course = {
    current_module: "Module 1",
    link: "https://example.com",
  };

  try {
    createCourse(course);
    throw new Error("Should have thrown an error for missing name");
  } catch (err) {
    assert(
      err.message.includes("name"),
      "Error should mention missing name field"
    );
  }
});

test("READ: should get a course by ID", () => {
  const course = {
    name: "Test Course",
    current_module: "Module 1",
    link: "https://example.com",
  };

  const created = createCourse(course);
  const retrieved = getCourse(created.id);

  assertEquals(retrieved.id, created.id, "IDs should match");
  assertEquals(retrieved.name, course.name, "Names should match");
});

test("READ: should return null for non-existent course", () => {
  const result = getCourse(99999);
  assertEquals(result, null, "Should return null for non-existent ID");
});

test("READ: should get all courses", () => {
  const countBefore = getAllCourses().length;
  createCourse({ name: "Course 1", current_module: "Module 1", link: "url1" });
  createCourse({ name: "Course 2", current_module: "Module 2", link: "url2" });

  const all = getAllCourses();
  assertEquals(all.length, countBefore + 2, "Should return newly created courses plus any prior data");
  assert(all.some(c => c.name === "Course 1"), "Course 1 should be in results");
  assert(all.some(c => c.name === "Course 2"), "Course 2 should be in results");
});

test("UPDATE: should update a course", () => {
  const course = createCourse({
    name: "Original Name",
    current_module: "Module 1",
    link: "https://example.com",
  });

  const updated = updateCourse(course.id, {
    name: "Updated Name",
    current_module: "Module 2",
  });

  assertEquals(updated.name, "Updated Name", "Name should be updated");
  assertEquals(updated.current_module, "Module 2", "Module should be updated");
});

test("UPDATE: should not update non-existent course", () => {
  const result = updateCourse(99999, { name: "New Name" });
  assertEquals(result, null, "Should return null for non-existent ID");
});

test("DELETE: should remove a course", () => {
  const course = createCourse({
    name: "To Delete",
    current_module: "Module 1",
    link: "url",
  });

  const deleted = deleteCourse(course.id);
  assert(deleted, "Delete should return true");

  const retrieved = getCourse(course.id);
  assertEquals(retrieved, null, "Deleted course should not exist");
});

test("DELETE: should not delete non-existent course", () => {
  const result = deleteCourse(99999);
  assertEquals(result, false, "Should return false for non-existent ID");
});

teardown();

console.log("\n✓ All tests passed!");
