import express from "express";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import "./db/database.js"; // imports and run DB set up
import coursesRouter from "./routes/courses.js";
import bookmarksRouter from "./routes/bookmarks.js";
import githubRouter from "./routes/github.js";
import authRouter from "./routes/auth.js";
import calendarRouter from "./routes/calendar.js";
import tasksRouter from "./routes/tasks.js";
import { getSwaggerOptions } from "./docs/swaggerConfig.js";

// --- App Configuration ---
const app = express();
const PORT = process.env.PORT ?? 3000;
const ENV = process.env.ENV ?? "production";
const isDev = ENV === "development";

// Generate OpenAPI spec dynamically from JSDoc comments with current PORT
const swaggerOptions = getSwaggerOptions(PORT);
const openAPISpec = swaggerJsdoc(swaggerOptions);

// --- Middleware ---
const morganFormat = isDev ? "short" : "tiny";

// Skip favicon and other static file requests from logs
const morganOptions = {
  skip: (req) => req.url === "/favicon.ico",
};

app.use(morgan(morganFormat, morganOptions)); // Logger (skips favicon requests)
app.use(express.json()); // JSON body parser for POST/PUT request

// --- API Routes ---
app.get("/", (req, res) => {
  res.json({ message: "Hello from Dashboard Backend!" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Documentation (with dynamic port awareness)
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openAPISpec));

// Authentication endpoints
app.use("/auth", authRouter);

// Courses CRUD endpoints
app.use("/courses", coursesRouter);

// Bookmarks CRUD endpoints
app.use("/bookmarks", bookmarksRouter);

// GitHub repositories endpoint
app.use("/github", githubRouter);

// Google Calendar endpoint
app.use("/calendar", calendarRouter);

// Google Tasks endpoint
app.use("/tasks", tasksRouter);

// --- Start Server ---
app.listen(PORT, () => {
  const mode = isDev ? "DEVELOPMENT" : "PRODUCTION";
  console.log(`[${mode}] Backend server running on http://localhost:${PORT}`);
});
