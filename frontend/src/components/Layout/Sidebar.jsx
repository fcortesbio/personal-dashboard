import React, { useState, useEffect } from 'react';
import { useCourses } from '../../hooks/useCourses';
import { useBookmarks } from '../../hooks/useBookmarks';
import { useRepos } from '../../hooks/useRepos';

export function Sidebar() {
  const [expandedSections, setExpandedSections] = useState({
    courses: true,
    bookmarks: true,
    repos: true,
  });

  const { courses } = useCourses();
  const { bookmarks } = useBookmarks();
  const { repos, fetchRepos } = useRepos('fcortesbio', 5);

  useEffect(() => {
    fetchRepos('fcortesbio');
  }, []);

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
            <span>Courses ({courses.length})</span>
            <span className={`text-sm text-gray-500 transition ${expandedSections.courses ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {expandedSections.courses && (
            <div className="mt-2 space-y-1 ml-2">
              {courses.length > 0 ? (
                courses.map(course => (
                  <a
                    key={course.id}
                    href="#"
                    className="block text-sm text-blue-600 hover:text-blue-800 truncate"
                    onClick={(e) => e.preventDefault()}
                  >
                    {course.name}
                  </a>
                ))
              ) : (
                <p className="text-sm text-gray-500">No courses yet</p>
              )}
            </div>
          )}
        </div>

        {/* Bookmarks Section */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('bookmarks')}
            className="w-full flex justify-between items-center py-2 px-3 font-semibold text-gray-900 hover:bg-gray-200 rounded transition"
          >
            <span>Bookmarks ({bookmarks.length})</span>
            <span className={`text-sm text-gray-500 transition ${expandedSections.bookmarks ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {expandedSections.bookmarks && (
            <div className="mt-2 space-y-1 ml-2">
              {bookmarks.length > 0 ? (
                bookmarks.map(bookmark => (
                  <a
                    key={bookmark.id}
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-blue-600 hover:text-blue-800 truncate"
                  >
                    {bookmark.name}
                  </a>
                ))
              ) : (
                <p className="text-sm text-gray-500">No bookmarks yet</p>
              )}
            </div>
          )}
        </div>

        {/* GitHub Repos Section */}
        <div className="mb-6">
          <button
            onClick={() => toggleSection('repos')}
            className="w-full flex justify-between items-center py-2 px-3 font-semibold text-gray-900 hover:bg-gray-200 rounded transition"
          >
            <span>GitHub Repos ({repos.length})</span>
            <span className={`text-sm text-gray-500 transition ${expandedSections.repos ? 'rotate-180' : ''}`}>▼</span>
          </button>
          {expandedSections.repos && (
            <div className="mt-2 space-y-1 ml-2">
              {repos.length > 0 ? (
                repos.map(repo => (
                  <a
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm text-blue-600 hover:text-blue-800 truncate"
                    title={repo.name}
                  >
                    {repo.name}
                  </a>
                ))
              ) : (
                <p className="text-sm text-gray-500">No repos found</p>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
