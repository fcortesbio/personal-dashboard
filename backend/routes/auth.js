import express from "express";
import rateLimit from "express-rate-limit";
import {
  generateAuthUrl,
  handleAuthCallback,
  isAuthenticated,
} from "../controllers/auth.js";

const router = express.Router();

// Rate limiter for OAuth endpoints (10 requests per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  message: {
    error: "Too many authentication attempts",
    message: "Please try again later",
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

/**
 * @swagger
 * /auth/google/login:
 *   get:
 *     summary: Initiate Google OAuth Login
 *     description: Redirects user to Google's consent screen to initiate OAuth flow
 *     tags: [Google OAuth]
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth consent screen
 *         headers:
 *           Location:
 *             schema:
 *               type: string
 *               format: uri
 *               example: https://accounts.google.com/o/oauth2/v2/auth?...
 *       500:
 *         description: Failed to generate authorization URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Failed to initiate login
 *                 details:
 *                   type: string
 *                   example: Failed to generate authorization URL. Check your Google OAuth credentials
 */
router.get("/google/login", authLimiter, (req, res) => {
  try {
    const authUrl = generateAuthUrl();
    // Redirect to Google's OAuth consent screen
    res.redirect(authUrl);
  } catch (error) {
    console.error("Error initiating login:", error);
    res.status(500).json({
      error: "Failed to initiate login",
      details: error.message,
    });
  }
});

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Handle Google OAuth Callback
 *     description: Callback endpoint that Google redirects to after user consent. Exchanges authorization code for tokens and stores them server-side.
 *     tags: [Google OAuth]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: false
 *         schema:
 *           type: string
 *         description: Authorization code from Google (returned if user consented)
 *       - in: query
 *         name: error
 *         required: false
 *         schema:
 *           type: string
 *         description: Error code if user denied consent (e.g., "access_denied")
 *     responses:
 *       200:
 *         description: Authentication successful. Tokens received and stored in database
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Authentication successful! Your dashboard is now connected to Google Calendar and Tasks.
 *       400:
 *         description: Bad Request - Missing authorization code or user denied consent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Missing authorization code
 *                 message:
 *                   type: string
 *                   example: No code received from Google
 *       500:
 *         description: Internal Server Error - Failed to exchange code for tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Authentication failed
 *                 details:
 *                   type: string
 *                   example: Failed to authenticate with Google
 */
router.get("/google/callback", authLimiter, async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.status(400).json({
      error: error,
      message: "Authentication failed. Please try again.",
    });
  }

  if (!code) {
    return res.status(400).json({
      error: "Missing authorization code",
      message: "No code received from Google",
    });
  }

  try {
    await handleAuthCallback(code);

    res.json({
      success: true,
      message: "Authentication successful! Your dashboard is now connected to Google Calendar and Tasks.",
    });
  } catch (error) {
    console.error("Error during OAuth callback:", error);
    res.status(500).json({
      error: "Authentication failed",
      details: error.message,
    });
  }
});

/**
 * @swagger
 * /auth/status:
 *   get:
 *     summary: Check Authentication Status
 *     description: Returns current authentication status and login URL if not authenticated
 *     tags: [Google OAuth]
 *     responses:
 *       200:
 *         description: User is authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authenticated:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: You are authenticated
 *       401:
 *         description: User is not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authenticated:
 *                   type: boolean
 *                   example: false
 *                 loginUrl:
 *                   type: string
 *                   format: uri
 *                   description: URL to initiate login
 *                 message:
 *                   type: string
 *                   example: Not authenticated. Please log in.
 */
router.get("/status", (req, res) => {
  const authenticated = isAuthenticated();

  if (!authenticated) {
    return res.status(401).json({
      authenticated: false,
      loginUrl: generateAuthUrl(),
      message: "Not authenticated. Please log in.",
    });
  }

  res.json({
    authenticated: true,
    message: "You are authenticated",
  });
});

export default router;
