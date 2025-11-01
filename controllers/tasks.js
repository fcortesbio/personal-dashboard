import { google } from "googleapis";
import { getOAuth2Client } from "./auth.js";

/**
 * Get all task lists
 * @returns {Promise<Array>} Array of task lists
 */
async function getTaskLists() {
  try {
    const auth = getOAuth2Client();
    const googleTasks = google.tasks({ version: "v1", auth });

    const response = await googleTasks.tasklists.list();
    return response.data.items || [];
  } catch (error) {
    console.error("Error fetching task lists:", error);
    throw new Error("Failed to fetch task lists");
  }
}

/**
 * Get the primary task list ID
 * @returns {Promise<string>} Primary task list ID
 */
async function getPrimaryTaskListId() {
  try {
    const lists = await getTaskLists();
    if (lists.length === 0) {
      throw new Error("No task lists found");
    }
    console.log(`Found ${lists.length} task lists, using ID: ${lists[0].id}`);
    return lists[0].id;
  } catch (error) {
    console.error("Error getting primary task list:", error.message);
    // Fall back to @primary
    return "@primary";
  }
}

/**
 * List all tasks
 * @param {string} taskListId - Task list ID (optional, uses primary if not provided)
 * @returns {Promise<Array>} Array of tasks
 */
export async function listTasks(taskListId = null) {
  try {
    console.log("Fetching tasks...");
    const auth = getOAuth2Client();
    console.log("Got auth client");
    const googleTasks = google.tasks({ version: "v1", auth });
    console.log("Created Tasks API client");

    const id = taskListId || (await getPrimaryTaskListId());
    console.log(`Using task list: ${id}`);

    const response = await googleTasks.tasks.list({
      tasklist: id,
      showCompleted: true,
      showHidden: false,
      maxResults: 100,
    });

    const taskList = response.data.items || [];

    // Format tasks for API response
    return taskList.map((task) => ({
      id: task.id,
      title: task.title || "Untitled",
      status: task.status || "needsAction",
      completed: task.status === "completed",
      notes: task.notes || "",
      due: task.due || null,
      updated: task.updated || null,
    }));
  } catch (error) {
    console.error("Error fetching tasks:", JSON.stringify(error, null, 2));
    const message = error.message || error.errors?.[0]?.message || "Failed to fetch tasks";
    throw new Error(`Failed to fetch tasks: ${message}`);
  }
}

/**
 * Create a new task
 * @param {Object} taskData - Task data { title, notes, dueDate }
 * @param {string} taskListId - Task list ID (optional)
 * @returns {Promise<Object>} Created task
 */
export async function createTask(taskData, taskListId = null) {
  try {
    const auth = getOAuth2Client();
    const googleTasks = google.tasks({ version: "v1", auth });

    const id = taskListId || (await getPrimaryTaskListId());

    const taskBody = {
      title: taskData.title,
      notes: taskData.notes || "",
      due: taskData.dueDate || null,
    };

    const response = await googleTasks.tasks.insert({
      tasklist: id,
      requestBody: taskBody,
    });

    return {
      id: response.data.id,
      title: response.data.title,
      status: response.data.status,
      completed: response.data.status === "completed",
      notes: response.data.notes || "",
      due: response.data.due || null,
    };
  } catch (error) {
    console.error("Error creating task:", error);
    throw new Error("Failed to create task");
  }
}

/**
 * Mark a task as completed
 * @param {string} taskId - Task ID
 * @param {string} taskListId - Task list ID (optional)
 * @returns {Promise<Object>} Updated task
 */
export async function completeTask(taskId, taskListId = null) {
  try {
    if (!taskId) {
      throw new Error(`taskId is required but got: ${taskId}`);
    }
    const auth = getOAuth2Client();
    const googleTasks = google.tasks({ version: "v1", auth });

    const id = taskListId || (await getPrimaryTaskListId());

    console.log(`Completing task ${taskId} in list ${id}`);

    const response = await googleTasks.tasks.update({
      tasklist: id,
      task: taskId,
      requestBody: {
        id: taskId,
        status: "completed",
      },
    });

    return {
      id: response.data.id,
      title: response.data.title,
      status: response.data.status,
      completed: response.data.status === "completed",
      notes: response.data.notes || "",
      due: response.data.due || null,
    };
  } catch (error) {
    console.error("Error completing task:", error.message, error.code || "");
    throw error;
  }
}

/**
 * Mark a task as incomplete
 * @param {string} taskId - Task ID
 * @param {string} taskListId - Task list ID (optional)
 * @returns {Promise<Object>} Updated task
 */
export async function incompleteTask(taskId, taskListId = null) {
  try {
    const auth = getOAuth2Client();
    const googleTasks = google.tasks({ version: "v1", auth });

    const id = taskListId || (await getPrimaryTaskListId());

    const response = await googleTasks.tasks.update({
      tasklist: id,
      task: taskId,
      requestBody: {
        id: taskId,
        status: "needsAction",
      },
    });

    return {
      id: response.data.id,
      title: response.data.title,
      status: response.data.status,
      completed: response.data.status === "completed",
      notes: response.data.notes || "",
      due: response.data.due || null,
    };
  } catch (error) {
    console.error("Error updating task:", error);
    throw new Error("Failed to update task");
  }
}

/**
 * Delete a task
 * @param {string} taskId - Task ID
 * @param {string} taskListId - Task list ID (optional)
 * @returns {Promise<void>}
 */
export async function deleteTask(taskId, taskListId = null) {
  try {
    const auth = getOAuth2Client();
    const googleTasks = google.tasks({ version: "v1", auth });

    const id = taskListId || (await getPrimaryTaskListId());

    await googleTasks.tasks.delete({
      tasklist: id,
      task: taskId,
    });

    return { success: true, message: "Task deleted" };
  } catch (error) {
    console.error("Error deleting task:", error);
    throw new Error("Failed to delete task");
  }
}
