import express from "express";
import morgan from "morgan";
import "./db/database.js"; // imports and run DB set up
import coursesRouter from "./routes/courses.js";

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

// Courses CRUD endpoints
app.use("/courses", coursesRouter);

// --- Start Server ---
app.listen(PORT, () => {
  console.log("Backend server running on http://localhost:" + PORT);
});
