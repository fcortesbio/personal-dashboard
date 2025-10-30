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
 * POST /bookmarks
 * Create a new bookmark
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
 * GET /bookmarks
 * Get all bookmarks
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
 * GET /bookmarks/:id
 * Get a single bookmark by ID
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
 * PUT /bookmarks/:id
 * Update a bookmark
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
 * DELETE /bookmarks/:id
 * Delete a bookmark
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
