import { google } from "googleapis";
import { getOAuth2Client } from "./auth.js";

/**
 * Fetch upcoming calendar events
 * @param {number} days - Number of days to fetch (default: 7)
 * @returns {Promise<Array>} Array of events
 */
export async function fetchEvents(days = 7) {
  try {
    const auth = getOAuth2Client();
    const calendar = google.calendar({ version: "v3", auth });

    const now = new Date();
    const endDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: now.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 50,
    });

    const events = response.data.items || [];

    // Format events for API response
    return events.map((event) => ({
      id: event.id,
      summary: event.summary || "No title",
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      description: event.description || "",
      location: event.location || "",
    }));
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    throw new Error("Failed to fetch calendar events");
  }
}
