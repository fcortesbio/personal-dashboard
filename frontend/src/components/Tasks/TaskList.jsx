import React, { useState } from 'react';
import { useTasks } from '../../hooks/useTasks';

export function TaskList() {
  const { tasks, isLoading, error, createTask, toggleTaskComplete, deleteTask } = useTasks();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      setIsCreating(true);
      await createTask({ title: newTaskTitle });
      setNewTaskTitle('');
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const activeTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-3">Tasks</h2>

        {/* Create Task Form */}
        <form onSubmit={handleCreateTask} className="space-y-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="New task..."
            disabled={isCreating}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={isCreating || !newTaskTitle.trim()}
            className="w-full px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition disabled:bg-gray-300"
          >
            {isCreating ? 'Adding...' : 'Add Task'}
          </button>
        </form>
      </div>

      {/* Error Display */}
      {error && <div className="text-red-600 text-sm p-4">{error}</div>}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8 text-gray-600 text-sm">
          Loading tasks...
        </div>
      )}

      {/* Tasks List */}
      {!isLoading && (
        <div className="flex-1 overflow-y-auto">
          {/* Active Tasks */}
          {activeTasks.length > 0 && (
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Active</h3>
              <div className="space-y-2">
                {activeTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={() => toggleTaskComplete(task.id, task.completed)}
                    onDelete={() => deleteTask(task.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Completed</h3>
              <div className="space-y-2">
                {completedTasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={() => toggleTaskComplete(task.id, task.completed)}
                    onDelete={() => deleteTask(task.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {activeTasks.length === 0 && completedTasks.length === 0 && (
            <div className="p-4 text-center text-gray-500 text-sm">
              No tasks yet. Create one to get started!
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TaskItem({ task, onToggle, onDelete }) {
  return (
    <div
      className={`flex items-start gap-2 p-2 rounded border ${
        task.completed
          ? 'bg-gray-50 border-gray-200'
          : 'bg-white border-gray-200 hover:bg-gray-50'
      }`}
    >
      <input
        type="checkbox"
        checked={task.completed || false}
        onChange={onToggle}
        className="mt-1 cursor-pointer"
      />
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm break-words ${
            task.completed
              ? 'line-through text-gray-500'
              : 'text-gray-900'
          }`}
        >
          {task.title}
        </p>
        {task.notes && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.notes}</p>
        )}
      </div>
      <button
        onClick={onDelete}
        className="text-red-600 hover:text-red-800 text-xs font-semibold"
      >
        ×
      </button>
    </div>
  );
}
