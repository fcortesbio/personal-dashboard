import { useState, useEffect } from 'react';
import apiClient from '../api/client';

/**
 * Hook for managing bookmarks CRUD operations
 * @returns {Object} Bookmarks state and methods
 */
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  async function fetchBookmarks() {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get('/bookmarks');
      setBookmarks(response.bookmarks || []);
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err);
      setError(err.message);
      setBookmarks([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function createBookmark(bookmarkData) {
    try {
      setError(null);
      const response = await apiClient.post('/bookmarks', bookmarkData);
      setBookmarks([...bookmarks, response]);
      return response;
    } catch (err) {
      console.error('Failed to create bookmark:', err);
      setError(err.message);
      throw err;
    }
  }

  async function updateBookmark(bookmarkId, bookmarkData) {
    try {
      setError(null);
      const response = await apiClient.put(`/bookmarks/${bookmarkId}`, bookmarkData);
      setBookmarks(bookmarks.map(b => b.id === bookmarkId ? response : b));
      return response;
    } catch (err) {
      console.error('Failed to update bookmark:', err);
      setError(err.message);
      throw err;
    }
  }

  async function deleteBookmark(bookmarkId) {
    try {
      setError(null);
      await apiClient.delete(`/bookmarks/${bookmarkId}`);
      setBookmarks(bookmarks.filter(b => b.id !== bookmarkId));
    } catch (err) {
      console.error('Failed to delete bookmark:', err);
      setError(err.message);
      throw err;
    }
  }

  return {
    bookmarks,
    isLoading,
    error,
    createBookmark,
    updateBookmark,
    deleteBookmark,
    refetch: fetchBookmarks,
  };
}
