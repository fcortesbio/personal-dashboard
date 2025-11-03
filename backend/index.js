import express from "express";
import morgan from "morgan";
import cors from "cors";
import session from "express-session";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";
import "./db/database.js";
import coursesRouter from "./routes/courses.js";
import bookmarksRouter from "./routes/bookmarks.js";
import githubRouter from "./routes/github.js";
import authRouter from "./routes/auth.js";
import calendarRouter from "./routes/calendar.js";
import tasksRouter from "./routes/tasks.js";
import { getSwaggerOptions } from "./docs/swaggerConfig.js";

/**
 * Checks for all required environment variables.
 * If any are missing, it throws an error to prevent server startup.
 */
const validateEnvVariables = () => {
  // Add ALL variables you expect from your .env file
  const requiredEnvVars = [
    "PORT", // Now required
    "ENV", // Now required
    "GITHUB_TOKEN",
    "GITHUB_USERNAME",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REDIRECT_URI",
  ];

  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `[ENV ERROR] Missing required environment variables: ${missingVars.join(
        ", "
      )}. Server startup aborted.`
    );
  }

  console.log("[ENV] All required environment variables are loaded.");
};

/**
 * Main function to initialize and start the server.
 */
const startServer = () => {
  try {
    // --- 1. Validate Environment Variables ---
    // This will NOW fail if PORT or ENV are not loaded
    validateEnvVariables();

    // --- 2. App Configuration ---
    // We can now safely access these without defaults,
    // because validation would have failed already if they were missing.
    const app = express();
    const PORT = process.env.PORT;
    const ENV = process.env.ENV;
    const isDev = ENV === "development";

    const swaggerOptions = getSwaggerOptions(PORT);
    const openAPISpec = swaggerJsdoc(swaggerOptions);

    // --- 3. Middleware ---
    // CORS configuration
    app.use(
      cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
      })
    );

    // Session configuration
    app.use(
      session({
        secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: !isDev, // Use secure cookies in production (HTTPS)
          httpOnly: true,
          maxAge: 24 * 60 * 60 * 1000, // 24 hours
        },
      })
    );

    // HTTP request logging
    const morganFormat = isDev ? "short" : "tiny";
    const morganOptions = {
      skip: (req) => req.url === "/favicon.ico",
    };
    app.use(morgan(morganFormat, morganOptions));
    app.use(express.json());

    // --- 4. API Routes ---
    app.get("/", (req, res) => {
      res.json({ message: "Hello from Dashboard Backend!" });
    });

    app.get("/health", (req, res) => {
      res.json({ status: "ok", timestamp: new Date().toISOString() });
    });

    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openAPISpec));
    app.use("/auth", authRouter);
    app.use("/courses", coursesRouter);
    app.use("/bookmarks", bookmarksRouter);
    app.use("/github", githubRouter);
    app.use("/calendar", calendarRouter);
    app.use("/tasks", tasksRouter);

    // --- 5. Start Server ---
    const server = app.listen(PORT, () => {
      const mode = isDev ? "DEVELOPMENT" : "PRODUCTION";
      console.log(
        `[${mode}] Backend server running on http://localhost:${PORT}`
      );
    });

    // Handle port already in use errors
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(
          `❌ Port ${PORT} is already in use. Please free the port or change PORT in your .env file.`
        );
      } else {
        console.error("❌ Server error:", err.message);
      }
      process.exit(1);
    });
  } catch (error) {
    // --- Catch errors (like missing ENV vars) ---
    console.error("❌ Failed to start server:");
    console.error(error.message); // This will show you exactly what's missing
    process.exit(1);
  }
};

// --- Run the server ---
startServer();
