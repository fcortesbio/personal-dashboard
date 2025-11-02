import { google } from "googleapis";
import db from "../db/database.js";

const clientId = process.env.GOOGLE_CLIENT_ID || "";
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
const redirectUri = process.env.GOOGLE_REDIRECT_URI || "";

// Initialize OAuth2 client (lazy initialization to avoid blocking)
let oauth2Client = null;

function getOAuth2ClientInstance() {
  if (!oauth2Client) {
    oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  }
  return oauth2Client;
}

/**
 * Generate authorization URL for user to log in
 */
export function generateAuthUrl() {
  try {
    const scopes = [
      "https://www.googleapis.com/auth/calendar",
      "https://www.googleapis.com/auth/tasks",
    ];

    const url = getOAuth2ClientInstance().generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent",
    });

    return url;
  } catch (error) {
    console.error("Error generating auth URL:", error);
    throw new Error("Failed to generate authorization URL. Check your Google OAuth credentials.");
  }
}

/**
 * Exchange authorization code for tokens and store in database
 */
export async function handleAuthCallback(code) {
  try {
    const { tokens } = await getOAuth2ClientInstance().getToken(code);

    // Calculate expiration time in milliseconds
    // tokens.expiry_date is already a timestamp, or we can calculate from expires_in
    const expiresAt = tokens.expiry_date || (Date.now() + (tokens.expires_in * 1000));

    if (!expiresAt) {
      throw new Error("Unable to determine token expiration time");
    }

    // Delete existing tokens (keep only the latest)
    db.prepare("DELETE FROM auth_tokens").run();

    // Store new tokens
    db.prepare(
      `INSERT INTO auth_tokens (access_token, refresh_token, expires_at)
       VALUES (?, ?, ?)`
    ).run(tokens.access_token, tokens.refresh_token, expiresAt);

    return {
      success: true,
      message: "Authentication successful",
    };
  } catch (error) {
    console.error("Error during OAuth callback:", error);
    throw new Error("Failed to authenticate with Google");
  }
}

/**
 * Get valid access token, refreshing if necessary
 */
export async function getValidAccessToken() {
  try {
    const tokenRecord = db.prepare("SELECT * FROM auth_tokens LIMIT 1").get();

    if (!tokenRecord) {
      throw new Error("No authentication token found. Please log in first.");
    }

    const now = Date.now();

    // If token is still valid (with 5-minute buffer), return it
    if (tokenRecord.expires_at > now + 5 * 60 * 1000) {
      return tokenRecord.access_token;
    }

    // Token expired or expiring soon, refresh it
    return await refreshAccessToken(tokenRecord.refresh_token);
  } catch (error) {
    console.error("Error getting valid access token:", error);
    throw error;
  }
}

/**
 * Refresh the access token using refresh token
 */
export async function refreshAccessToken(refreshToken) {
  try {
    const client = getOAuth2ClientInstance();
    client.setCredentials({
      refresh_token: refreshToken,
    });

    const { credentials } = await client.refreshAccessToken();

    const expiresAt = Date.now() + (credentials.expiry_date - Date.now());

    db.prepare(
      `UPDATE auth_tokens 
       SET access_token = ?, expires_at = ?
       WHERE refresh_token = ?`
    ).run(credentials.access_token, expiresAt, refreshToken);

    return credentials.access_token;
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw error;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated() {
  try {
    const tokenRecord = db.prepare("SELECT * FROM auth_tokens LIMIT 1").get();
    return !!tokenRecord;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
}

/**
 * Get OAuth2 client configured with valid credentials
 */
export function getOAuth2Client() {
  try {
    const tokenRecord = db.prepare("SELECT * FROM auth_tokens LIMIT 1").get();

    if (!tokenRecord) {
      throw new Error("No authentication token found. Please log in first.");
    }

    const client = getOAuth2ClientInstance();
    client.setCredentials({
      access_token: tokenRecord.access_token,
      refresh_token: tokenRecord.refresh_token,
      expiry_date: tokenRecord.expires_at,
    });

    return client;
  } catch (error) {
    console.error("Error getting OAuth2 client:", error);
    throw error;
  }
}
