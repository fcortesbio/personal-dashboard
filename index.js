import express from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import "./db/database.js"; // imports and run DB set up
import coursesRouter from "./routes/courses.js";
import bookmarksRouter from "./routes/bookmarks.js";
import githubRouter from "./routes/github.js";
import { swaggerOptions } from "./docs/swaggerConfig.js";

// Generate OpenAPI spec dynamically from JSDoc comments
const openAPISpec = swaggerJsdoc(swaggerOptions);

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

// GitHub repositories endpoint
app.use("/github", githubRouter);

// --- Start Server ---
app.listen(PORT, () => {
  console.log("Backend server running on http://localhost:" + PORT);
});
