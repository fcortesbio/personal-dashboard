import express from "express";
import {
  listTasks,
  createTask,
  completeTask,
  incompleteTask,
  deleteTask,
} from "../controllers/tasks.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: List All Tasks
 *     description: Fetches all pending and completed tasks from Google Tasks. Requires authentication.
 *     tags: [Google Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tasks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "task-id-123"
 *                       title:
 *                         type: string
 *                         example: "Complete project proposal"
 *                       notes:
 *                         type: string
 *                         nullable: true
 *                         example: "Send to team lead for review"
 *                       status:
 *                         type: string
 *                         enum: [needsAction, completed]
 *                         example: "needsAction"
 *                       due:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                       completed:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                 count:
 *                   type: integer
 *                   example: 5
 *                 fetched_at:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - authentication required
 *       500:
 *         description: Failed to fetch tasks
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
    const tasks = await listTasks();

    res.json({
      tasks,
      count: tasks.length,
      fetched_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({
      error: "Failed to fetch tasks",
      details: error.message,
    });
  }
});

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a New Task
 *     description: Creates a new task in Google Tasks. Requires authentication.
 *     tags: [Google Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: Task title (required)
 *                 example: "Complete project proposal"
 *               notes:
 *                 type: string
 *                 description: Task notes (optional)
 *                 example: "Send to team lead for review"
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: Task due date in YYYY-MM-DD format (optional)
 *                 example: "2025-11-15"
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 task:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     notes:
 *                       type: string
 *                       nullable: true
 *                     status:
 *                       type: string
 *                       enum: [needsAction, completed]
 *                     due:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                 message:
 *                   type: string
 *                   example: "Task created successfully"
 *       400:
 *         description: Missing required field (title)
 *       401:
 *         description: Unauthorized - authentication required
 *       500:
 *         description: Failed to create task
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { title, notes, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({
        error: "Missing required field",
        message: "title is required",
      });
    }

    const task = await createTask({
      title,
      notes,
      dueDate,
    });

    res.status(201).json({
      success: true,
      task,
      message: "Task created successfully",
    });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({
      error: "Failed to create task",
      details: error.message,
    });
  }
});

/**
 * @swagger
 * /tasks/{id}:
 *   patch:
 *     summary: Mark Task as Complete/Incomplete
 *     description: Updates task completion status. Requires authentication.
 *     tags: [Google Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - completed
 *             properties:
 *               completed:
 *                 type: boolean
 *                 description: Whether the task should be marked as completed
 *                 example: true
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 task:
 *                   type: object
 *                 message:
 *                   type: string
 *                   example: "Task marked as completed"
 *       400:
 *         description: Missing required field (completed)
 *       401:
 *         description: Unauthorized - authentication required
 *       500:
 *         description: Failed to update task
 */
router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { completed } = req.body;
    console.log(`PATCH /tasks/:id called with id=${id}, completed=${completed}`);

    if (completed === undefined) {
      return res.status(400).json({
        error: "Missing required field",
        message: "completed is required",
      });
    }

    const task = completed
      ? await completeTask(id)
      : await incompleteTask(id);

    res.json({
      success: true,
      task,
      message: `Task marked as ${completed ? "completed" : "incomplete"}`,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({
      error: "Failed to update task",
      details: error.message,
    });
  }
});

/**
 * @swagger
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a Task
 *     description: Deletes a task from Google Tasks. Requires authentication.
 *     tags: [Google Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Task ID to delete
 *     responses:
 *       200:
 *         description: Task deleted successfully
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
 *                   example: "Task deleted successfully"
 *       401:
 *         description: Unauthorized - authentication required
 *       500:
 *         description: Failed to delete task
 */
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    await deleteTask(id);

    res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({
      error: "Failed to delete task",
      details: error.message,
    });
  }
});

export default router;
