import express from "express";
import {
  createCourse,
  getCourse,
  getAllCourses,
  updateCourse,
  deleteCourse,
} from "../controllers/courses.js";

const router = express.Router();

/**
 * POST /courses
 * Create a new course
 */
router.post("/", (req, res) => {
  try {
    const course = createCourse(req.body);
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * GET /courses
 * Get all courses
 */
router.get("/", (req, res) => {
  try {
    const courses = getAllCourses();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /courses/:id
 * Get a single course by ID
 */
router.get("/:id", (req, res) => {
  try {
    const course = getCourse(parseInt(req.params.id));
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /courses/:id
 * Update a course
 */
router.put("/:id", (req, res) => {
  try {
    const course = updateCourse(parseInt(req.params.id), req.body);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /courses/:id
 * Delete a course
 */
router.delete("/:id", (req, res) => {
  try {
    const deleted = deleteCourse(parseInt(req.params.id));
    if (!deleted) {
      return res.status(404).json({ error: "Course not found" });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
