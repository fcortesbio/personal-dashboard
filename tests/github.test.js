import { getRepositories } from "../controllers/github.js";

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

console.log("ℹ  GitHub API Controller Tests\n");

test("getRepositories: should require username", async () => {
  try {
    await getRepositories(null);
    throw new Error("Should have thrown an error for missing username");
  } catch (err) {
    assert(
      err.message.includes("username"),
      "Error should mention username requirement"
    );
  }
});

test("getRepositories: should validate limit range", async () => {
  try {
    await getRepositories("fcortesbio", 0);
    throw new Error("Should have thrown error for limit < 1");
  } catch (err) {
    assert(err.message.includes("Limit"), "Error should mention limit validation");
  }
});

test("getRepositories: should validate limit max", async () => {
  try {
    await getRepositories("fcortesbio", 101);
    throw new Error("Should have thrown error for limit > 100");
  } catch (err) {
    assert(err.message.includes("Limit"), "Error should mention limit validation");
  }
});

test("getRepositories: should reject invalid username", async () => {
  try {
    await getRepositories("this-username-definitely-does-not-exist-12345");
    throw new Error("Should have thrown error for invalid username");
  } catch (err) {
    assert(
      err.message.includes("not found") || err.message.includes("GitHub API error"),
      "Error should indicate user not found"
    );
  }
});

test("getRepositories: should fetch real repositories", async () => {
  const result = await getRepositories("fcortesbio", 5);

  assert(result.username === "fcortesbio", "Username should match");
  assert(
    result.profile_url === "https://github.com/fcortesbio",
    "Profile URL should be correct"
  );
  assert(Array.isArray(result.repositories), "Should return repositories array");
  assert(result.repositories.length > 0, "Should have at least one repository");

  // Check repo structure
  const repo = result.repositories[0];
  assert(repo.id !== undefined, "Repo should have id");
  assert(repo.name !== undefined, "Repo should have name");
  assert(repo.description !== undefined, "Repo should have description");
  assert(repo.url !== undefined, "Repo should have url");
  assert(repo.updated_at !== undefined, "Repo should have updated_at");
});

test("getRepositories: should respect limit parameter", async () => {
  const result = await getRepositories("fcortesbio", 3);
  assertEquals(result.repositories.length, 3, "Should return exactly 3 repos");
});

test("getRepositories: should sort by updated_at (descending)", async () => {
  const result = await getRepositories("fcortesbio", 5);

  // Verify repos are sorted by updated_at in descending order
  for (let i = 1; i < result.repositories.length; i++) {
    const prev = new Date(result.repositories[i - 1].updated_at).getTime();
    const curr = new Date(result.repositories[i].updated_at).getTime();
    assert(
      prev >= curr,
      `Repos should be sorted by updated_at descending: ${result.repositories[i - 1].name} (${prev}) should be >= ${result.repositories[i].name} (${curr})`
    );
  }
});

test("getRepositories: should include fetched_at timestamp", async () => {
  const result = await getRepositories("fcortesbio", 1);
  assert(result.fetched_at !== undefined, "Should include fetched_at");
  assert(
    !isNaN(new Date(result.fetched_at).getTime()),
    "fetched_at should be valid ISO timestamp"
  );
});

console.log("\n✓ All GitHub API tests passed!");