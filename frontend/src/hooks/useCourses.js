import { useState, useEffect } from 'react';
import apiClient from '../api/client';

/**
 * Hook for managing courses CRUD operations
 * @returns {Object} Courses state and methods
 */
export function useCourses() {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get('/courses');
      setCourses(response.courses || []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setError(err.message);
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function createCourse(courseData) {
    try {
      setError(null);
      const response = await apiClient.post('/courses', courseData);
      setCourses([...courses, response]);
      return response;
    } catch (err) {
      console.error('Failed to create course:', err);
      setError(err.message);
      throw err;
    }
  }

  async function updateCourse(courseId, courseData) {
    try {
      setError(null);
      const response = await apiClient.put(`/courses/${courseId}`, courseData);
      setCourses(courses.map(c => c.id === courseId ? response : c));
      return response;
    } catch (err) {
      console.error('Failed to update course:', err);
      setError(err.message);
      throw err;
    }
  }

  async function deleteCourse(courseId) {
    try {
      setError(null);
      await apiClient.delete(`/courses/${courseId}`);
      setCourses(courses.filter(c => c.id !== courseId));
    } catch (err) {
      console.error('Failed to delete course:', err);
      setError(err.message);
      throw err;
    }
  }

  return {
    courses,
    isLoading,
    error,
    createCourse,
    updateCourse,
    deleteCourse,
    refetch: fetchCourses,
  };
}
