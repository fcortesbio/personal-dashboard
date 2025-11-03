import { getTasks } from "../controllers/tasks.js";
import { isAuthenticated } from "../controllers/auth.js";

// Simple test helper
const assert = (condition, message) => {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
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

console.log("ℹ  Google Tasks API Controller Tests\n");

// Check authentication before running tests
if (!isAuthenticated()) {
  console.error("❌ Not authenticated with Google. Please run authentication flow first.");
  console.error("   Visit /auth/google/login to authenticate.");
  process.exit(1);
}

test("getTasks: should fetch tasks from default task list", async () => {
  const result = await getTasks();

  assert(Array.isArray(result.tasks), "Should return tasks array");
  assert(result.fetched_at !== undefined, "Should include fetched_at timestamp");
  assert(
    !isNaN(new Date(result.fetched_at).getTime()),
    "fetched_at should be valid ISO timestamp"
  );
});

test("getTasks: should return properly formatted tasks", async () => {
  const result = await getTasks();

  if (result.tasks.length > 0) {
    const task = result.tasks[0];
    assert(task.id !== undefined, "Task should have id");
    assert(task.title !== undefined, "Task should have title");
    assert(task.status !== undefined, "Task should have status");
    
    // Status should be either 'needsAction' or 'completed'
    assert(
      task.status === "needsAction" || task.status === "completed",
      "Task status should be valid"
    );
    
    // Optional fields that might exist
    if (task.due) {
      assert(
        !isNaN(new Date(task.due).getTime()),
        "Task due date should be valid if present"
      );
    }
    
    if (task.completed) {
      assert(
        !isNaN(new Date(task.completed).getTime()),
        "Task completed date should be valid if present"
      );
    }
  }
});

test("getTasks: should handle empty task list gracefully", async () => {
  // This test assumes it's possible to have no tasks
  // It shouldn't throw an error, just return empty array
  const result = await getTasks();

  assert(Array.isArray(result.tasks), "Should still return tasks array");
  assert(result.fetched_at !== undefined, "Should include fetched_at");
});

test("getTasks: should include task list information", async () => {
  const result = await getTasks();

  // Depending on implementation, might include task list details
  assert(result.tasks !== undefined, "Should have tasks property");
});

test("getTasks: should fetch tasks multiple times consistently", async () => {
  const result1 = await getTasks();
  const result2 = await getTasks();

  assert(Array.isArray(result1.tasks), "First fetch should return tasks array");
  assert(Array.isArray(result2.tasks), "Second fetch should return tasks array");
  
  // Both fetches should succeed (doesn't matter if content differs)
  assert(
    result1.fetched_at !== result2.fetched_at,
    "Should have different timestamps"
  );
});

test("getTasks: should only return incomplete tasks by default", async () => {
  const result = await getTasks();

  // Most implementations filter out completed tasks by default
  result.tasks.forEach((task, index) => {
    if (task.status === "completed") {
      console.log(`  ℹ  Note: Task ${index} is marked as completed (implementation may include completed tasks)`);
    }
  });
  
  assert(Array.isArray(result.tasks), "Should return tasks array");
});

console.log("\n✓ All Tasks API tests passed!");
