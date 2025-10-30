import express from "express";
import { getRepositories } from "../controllers/github.js";

const router = express.Router();

/**
 * @swagger
 * /github:
 *   get:
 *     summary: Get GitHub repositories for a user
 *     tags: [GitHub]
 *     parameters:
 *       - in: query
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         example: "fcortesbio"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 5
 *         example: 5
 *     responses:
 *       200:
 *         description: List of user's repositories with profile URL
 *       400:
 *         description: Invalid parameters
 *       404:
 *         description: GitHub user not found
 *       500:
 *         description: GitHub API error
 */
router.get("/", async (req, res) => {
  try {
    const { username, limit = 5 } = req.query;

    if (!username) {
      return res.status(400).json({ error: "username query parameter is required" });
    }

    const result = await getRepositories(username, parseInt(limit));
    res.json(result);
  } catch (err) {
    if (err.message.includes("not found")) {
      return res.status(404).json({ error: err.message });
    }
    if (err.message.includes("rate limit")) {
      return res.status(429).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

export default router;
