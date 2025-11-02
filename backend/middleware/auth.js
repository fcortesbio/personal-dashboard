import { isAuthenticated, generateAuthUrl } from "../controllers/auth.js";

/**
 * Middleware to ensure user is authenticated
 * If not authenticated, redirects to login
 */
export function requireAuth(req, res, next) {
  if (!isAuthenticated()) {
    return res.status(401).json({
      error: "Not authenticated",
      loginUrl: generateAuthUrl(),
      message: "Please visit the login URL to authenticate with Google",
    });
  }

  next();
}
