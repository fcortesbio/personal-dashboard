import createTestDatabase from "../db/test-database.js";
import {
  createBookmark as createBookmarkController,
  getBookmark as getBookmarkController,
  getAllBookmarks as getAllBookmarksController,
  updateBookmark as updateBookmarkController,
  deleteBookmark as deleteBookmarkController,
} from "../controllers/bookmarks.js";

// Create isolated test database
const db = createTestDatabase();

// Wrap controller functions to use test database
const createBookmark = (bookmark) => createBookmarkController(bookmark, db);
const getBookmark = (id) => getBookmarkController(id, db);
const getAllBookmarks = () => getAllBookmarksController(db);
const updateBookmark = (id, updates) => updateBookmarkController(id, updates, db);
const deleteBookmark = (id) => deleteBookmarkController(id, db);

// Simple test helper
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

setup();

test("CREATE: should insert a new bookmark", () => {
  const bookmark = {
    name: "GitHub",
    link: "https://github.com",
  };

  const result = createBookmark(bookmark);
  assert(result.id > 0, "Bookmark ID should be greater than 0");
  assertEquals(result.name, bookmark.name, "Bookmark name should match");
  assertEquals(result.link, bookmark.link, "Bookmark link should match");
});

test("CREATE: should require name field", () => {
  const bookmark = {
    link: "https://example.com",
  };

  try {
    createBookmark(bookmark);
    throw new Error("Should have thrown an error for missing name");
  } catch (err) {
    assert(
      err.message.includes("name"),
      "Error should mention missing name field"
    );
  }
});

test("CREATE: should allow optional link field", () => {
  const bookmark = {
    name: "My Bookmark",
  };

  const result = createBookmark(bookmark);
  assertEquals(result.link, null, "Link should be null when not provided");
});

test("READ: should get a bookmark by ID", () => {
  const bookmark = {
    name: "Test Bookmark",
    link: "https://example.com",
  };

  const created = createBookmark(bookmark);
  const retrieved = getBookmark(created.id);

  assertEquals(retrieved.id, created.id, "IDs should match");
  assertEquals(retrieved.name, bookmark.name, "Names should match");
  assertEquals(retrieved.link, bookmark.link, "Links should match");
});

test("READ: should return null for non-existent bookmark", () => {
  const result = getBookmark(99999);
  assertEquals(result, null, "Should return null for non-existent ID");
});

test("READ: should get all bookmarks", () => {
  const countBefore = getAllBookmarks().length;
  createBookmark({ name: "Bookmark 1", link: "https://url1.com" });
  createBookmark({ name: "Bookmark 2", link: "https://url2.com" });

  const all = getAllBookmarks();
  assertEquals(all.length, countBefore + 2, "Should return newly created bookmarks plus any prior data");
  assert(all.some(b => b.name === "Bookmark 1"), "Bookmark 1 should be in results");
  assert(all.some(b => b.name === "Bookmark 2"), "Bookmark 2 should be in results");
});

test("UPDATE: should update a bookmark", () => {
  const bookmark = createBookmark({
    name: "Original Name",
    link: "https://original.com",
  });

  const updated = updateBookmark(bookmark.id, {
    name: "Updated Name",
    link: "https://updated.com",
  });

  assertEquals(updated.name, "Updated Name", "Name should be updated");
  assertEquals(updated.link, "https://updated.com", "Link should be updated");
});

test("UPDATE: should support partial updates", () => {
  const bookmark = createBookmark({
    name: "Original Name",
    link: "https://original.com",
  });

  const updated = updateBookmark(bookmark.id, {
    name: "New Name",
  });

  assertEquals(updated.name, "New Name", "Name should be updated");
  assertEquals(
    updated.link,
    "https://original.com",
    "Link should remain unchanged"
  );
});

test("UPDATE: should not update non-existent bookmark", () => {
  const result = updateBookmark(99999, { name: "New Name" });
  assertEquals(result, null, "Should return null for non-existent ID");
});

test("DELETE: should remove a bookmark", () => {
  const bookmark = createBookmark({
    name: "To Delete",
    link: "https://delete.com",
  });

  const deleted = deleteBookmark(bookmark.id);
  assert(deleted, "Delete should return true");

  const retrieved = getBookmark(bookmark.id);
  assertEquals(retrieved, null, "Deleted bookmark should not exist");
});

test("DELETE: should not delete non-existent bookmark", () => {
  const result = deleteBookmark(99999);
  assertEquals(result, false, "Should return false for non-existent ID");
});

teardown();

console.log("\n✓ All tests passed!");
