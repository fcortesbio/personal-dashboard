import express from "express";

import {
  createBookmark,
  getBookmark,
  getAllBookmarks,
  updateBookmark,
  deleteBookmark,
} from "../controllers/bookmarks.js";

const router = express.Router();

/**
 * @swagger
 * /bookmarks:
 *   post:
 *     summary: Create a new bookmark
 *     tags: [Bookmarks]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "GitHub"
 *               link:
 *                 type: string
 *                 example: "https://github.com"
 *     responses:
 *       201:
 *         description: Bookmark created successfully
 */
router.post("/", (req, res) => {
  try {
    const bookmark = createBookmark(req.body);
    res.status(201).json(bookmark);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /bookmarks:
 *   get:
 *     summary: Get all bookmarks
 *     tags: [Bookmarks]
 *     responses:
 *       200:
 *         description: List of all bookmarks
 */
router.get("/", (req, res) => {
  try {
    const bookmarks = getAllBookmarks();
    res.status(200).json(bookmarks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /bookmarks/{id}:
 *   get:
 *     summary: Get a bookmark by ID
 *     tags: [Bookmarks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Bookmark found
 *       404:
 *         description: Bookmark not found
 */
router.get("/:id", (req, res) => {
  try {
    const bookmark = getBookmark(parseInt(req.params.id));
    res.status(200).json(bookmark);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /bookmarks/{id}:
 *   put:
 *     summary: Update a bookmark
 *     tags: [Bookmarks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               link:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bookmark updated successfully
 *       404:
 *         description: Bookmark not found
 */
router.put("/:id", (req, res) => {
  try {
    const bookmark = updateBookmark(parseInt(req.params.id), req.body);
    if (!bookmark) {
      return res.status(404).json({ error: "Bookmark not found" });
    }
    res.status(200).json(bookmark);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /bookmarks/{id}:
 *   delete:
 *     summary: Delete a bookmark
 *     tags: [Bookmarks]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Bookmark deleted successfully
 *       404:
 *         description: Bookmark not found
 */
router.delete("/:id", (req, res) => {
  try {
    const bookmark = deleteBookmark(parseInt(req.params.id));
    if (!bookmark) {
      return res.status(404).json({ error: "Bookmark not found" });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
