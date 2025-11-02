import React from 'react';

export function TaskList() {
  return (
    <div className="w-80 bg-white border-l border-gray-200 h-full overflow-y-auto">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Tasks</h2>
        <div className="space-y-2">
          <p className="text-gray-600 text-sm">Tasks coming soon...</p>
        </div>
      </div>
    </div>
  );
}
