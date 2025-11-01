import express from "express";
import { fetchEvents } from "../controllers/calendar.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * /calendar:
 *   get:
 *     summary: Fetch Upcoming Calendar Events
 *     description: Fetches upcoming calendar events for the specified number of days. Requires authentication.
 *     tags: [Google Calendar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           default: 7
 *         description: Number of days to fetch events for (default is 7)
 *         example: 7
 *     responses:
 *       200:
 *         description: Successfully retrieved calendar events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 events:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "event-id-123"
 *                       summary:
 *                         type: string
 *                         description: Event title
 *                         example: "Team Meeting"
 *                       description:
 *                         type: string
 *                         nullable: true
 *                         example: "Weekly sync with the team"
 *                       start:
 *                         type: object
 *                         properties:
 *                           dateTime:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-11-05T10:00:00Z"
 *                           timeZone:
 *                             type: string
 *                             example: "America/Los_Angeles"
 *                       end:
 *                         type: object
 *                         properties:
 *                           dateTime:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-11-05T11:00:00Z"
 *                           timeZone:
 *                             type: string
 *                       location:
 *                         type: string
 *                         nullable: true
 *                         example: "Conference Room A"
 *                       attendees:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             email:
 *                               type: string
 *                             displayName:
 *                               type: string
 *                             responseStatus:
 *                               type: string
 *                               enum: [needsAction, declined, tentative, accepted]
 *                       htmlLink:
 *                         type: string
 *                         format: uri
 *                         description: Link to the event in Google Calendar
 *                 count:
 *                   type: integer
 *                   description: Number of events returned
 *                   example: 3
 *                 days:
 *                   type: integer
 *                   description: Number of days queried
 *                   example: 7
 *                 fetched_at:
 *                   type: string
 *                   format: date-time
 *                   description: Timestamp when events were fetched
 *       400:
 *         description: Invalid days parameter (must be between 1 and 365)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid days parameter"
 *                 message:
 *                   type: string
 *                   example: "Days must be between 1 and 365"
 *       401:
 *         description: Unauthorized - authentication required
 *       500:
 *         description: Failed to fetch calendar events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                 details:
 *                   type: string
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;

    if (days < 1 || days > 365) {
      return res.status(400).json({
        error: "Invalid days parameter",
        message: "Days must be between 1 and 365",
      });
    }

    const events = await fetchEvents(days);

    res.json({
      events,
      count: events.length,
      days,
      fetched_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    res.status(500).json({
      error: "Failed to fetch calendar events",
      details: error.message,
    });
  }
});

export default router;
