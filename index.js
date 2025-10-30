import express from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import { readFileSync } from "fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import "./db/database.js"; // imports and run DB set up
import coursesRouter from "./routes/courses.js";
import bookmarksRouter from "./routes/bookmarks.js";

// Load OpenAPI spec
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const openAPIPath = path.join(__dirname, "docs", "openapi.json");
const openAPISpec = JSON.parse(readFileSync(openAPIPath, "utf-8"));

// --- App Configuration ---
const app = express();
const PORT = process.env.PORT ?? 3000;

// --- Middleware ---
app.use(morgan("short")); // Logger
app.use(express.json()); // JSON body parser for POST/PUT request

// --- API Routes ---
app.get("/", (req, res) => {
  res.json({ message: "Hello from Dashboard Backend!" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openAPISpec));

// Courses CRUD endpoints
app.use("/courses", coursesRouter);

// Bookmarks CRUD endpoints
app.use("/bookmarks", bookmarksRouter);

// --- Start Server ---
app.listen(PORT, () => {
  console.log("Backend server running on http://localhost:" + PORT);
});
