import { getCalendarEvents } from "../controllers/calendar.js";
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

console.log("ℹ  Google Calendar API Controller Tests\n");

// Check authentication before running tests
if (!isAuthenticated()) {
  console.error("❌ Not authenticated with Google. Please run authentication flow first.");
  console.error("   Visit /auth/google/login to authenticate.");
  process.exit(1);
}

test("getCalendarEvents: should reject invalid days parameter (negative)", async () => {
  try {
    await getCalendarEvents(-1);
    throw new Error("Should have thrown error for negative days");
  } catch (err) {
    assert(
      err.message.includes("Days parameter") || err.message.includes("must be"),
      "Error should mention days parameter validation"
    );
  }
});

test("getCalendarEvents: should reject invalid days parameter (zero)", async () => {
  try {
    await getCalendarEvents(0);
    throw new Error("Should have thrown error for zero days");
  } catch (err) {
    assert(
      err.message.includes("Days parameter") || err.message.includes("must be"),
      "Error should mention days parameter validation"
    );
  }
});

test("getCalendarEvents: should reject invalid days parameter (too large)", async () => {
  try {
    await getCalendarEvents(366);
    throw new Error("Should have thrown error for days > 365");
  } catch (err) {
    assert(
      err.message.includes("Days parameter") || err.message.includes("must be"),
      "Error should mention days parameter validation"
    );
  }
});

test("getCalendarEvents: should fetch events with default 7 days", async () => {
  const result = await getCalendarEvents();

  assert(Array.isArray(result.events), "Should return events array");
  assert(result.fetched_at !== undefined, "Should include fetched_at timestamp");
  assert(
    !isNaN(new Date(result.fetched_at).getTime()),
    "fetched_at should be valid ISO timestamp"
  );
  assert(result.days !== undefined, "Should include days parameter");
  assert(result.days === 7, "Default days should be 7");
});

test("getCalendarEvents: should respect custom days parameter", async () => {
  const result = await getCalendarEvents(14);

  assert(result.days === 14, "Should return events for 14 days");
  assert(Array.isArray(result.events), "Should return events array");
});

test("getCalendarEvents: should return properly formatted events", async () => {
  const result = await getCalendarEvents(7);

  if (result.events.length > 0) {
    const event = result.events[0];
    assert(event.id !== undefined, "Event should have id");
    assert(event.summary !== undefined, "Event should have summary");
    assert(event.start !== undefined, "Event should have start");
    assert(event.end !== undefined, "Event should have end");
    assert(event.htmlLink !== undefined, "Event should have htmlLink");
    
    // Verify date format
    assert(
      !isNaN(new Date(event.start).getTime()),
      "Event start should be valid date"
    );
    assert(
      !isNaN(new Date(event.end).getTime()),
      "Event end should be valid date"
    );
  }
});

test("getCalendarEvents: should handle empty calendar gracefully", async () => {
  // This test assumes it's possible to have no events
  // It shouldn't throw an error, just return empty array
  const result = await getCalendarEvents(1); // Use 1 day to increase chance of empty result

  assert(Array.isArray(result.events), "Should still return events array");
  assert(result.days === 1, "Days parameter should be respected");
});

console.log("\n✓ All Calendar API tests passed!");
