import { useState, useEffect } from 'react';
import apiClient from '../api/client';

/**
 * Hook for managing tasks CRUD operations
 * @returns {Object} Tasks state and methods
 */
export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get('/tasks');
      setTasks(response.tasks || []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
      setError(err.message);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function createTask(taskData) {
    try {
      setError(null);
      const response = await apiClient.post('/tasks', taskData);
      setTasks([...tasks, response]);
      return response;
    } catch (err) {
      console.error('Failed to create task:', err);
      setError(err.message);
      throw err;
    }
  }

  async function updateTask(taskId, taskData) {
    try {
      setError(null);
      const response = await apiClient.patch(`/tasks/${taskId}`, taskData);
      setTasks(tasks.map(t => t.id === taskId ? response : t));
      return response;
    } catch (err) {
      console.error('Failed to update task:', err);
      setError(err.message);
      throw err;
    }
  }

  async function deleteTask(taskId) {
    try {
      setError(null);
      await apiClient.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError(err.message);
      throw err;
    }
  }

  async function toggleTaskComplete(taskId, isComplete) {
    return updateTask(taskId, { completed: !isComplete });
  }

  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    refetch: fetchTasks,
  };
}
