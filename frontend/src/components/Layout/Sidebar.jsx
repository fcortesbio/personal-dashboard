import React, { useState } from 'react';

export function Sidebar() {
  const [expandedSections, setExpandedSections] = useState({
    courses: true,
    bookmarks: true,
    repos: true,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-6">
        {/* Courses Section */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('courses')}
            className="w-full flex justify-between items-center py-2 px-3 font-semibold text-gray-900 hover:bg-gray-200 rounded transition"
          >
            <span>Courses</span>
            <span className="text-sm text-gray-500">▼</span>
          </button>
          {expandedSections.courses && (
            <div className="mt-2 space-y-1 ml-2">
              <p className="text-sm text-gray-500">No courses yet</p>
            </div>
          )}
        </div>

        {/* Bookmarks Section */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('bookmarks')}
            className="w-full flex justify-between items-center py-2 px-3 font-semibold text-gray-900 hover:bg-gray-200 rounded transition"
          >
            <span>Bookmarks</span>
            <span className="text-sm text-gray-500">▼</span>
          </button>
          {expandedSections.bookmarks && (
            <div className="mt-2 space-y-1 ml-2">
              <p className="text-sm text-gray-500">No bookmarks yet</p>
            </div>
          )}
        </div>

        {/* GitHub Repos Section */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('repos')}
            className="w-full flex justify-between items-center py-2 px-3 font-semibold text-gray-900 hover:bg-gray-200 rounded transition"
          >
            <span>GitHub Repos</span>
            <span className="text-sm text-gray-500">▼</span>
          </button>
          {expandedSections.repos && (
            <div className="mt-2 space-y-1 ml-2">
              <p className="text-sm text-gray-500">No repos yet</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
