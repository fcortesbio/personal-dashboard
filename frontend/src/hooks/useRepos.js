import { useState } from 'react';
import apiClient from '../api/client';

/**
 * Hook for fetching GitHub repositories
 * @param {string} username - GitHub username
 * @param {number} limit - Maximum number of repos to fetch (default: 5)
 * @returns {Object} Repos state and methods
 */
export function useRepos(username = '', limit = 5) {
  const [repos, setRepos] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchRepos(user = username) {
    if (!user) {
      setError('Username is required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get(`/github?username=${user}&limit=${limit}`);
      setRepos(response.repos || []);
    } catch (err) {
      console.error('Failed to fetch repos:', err);
      setError(err.message);
      setRepos([]);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    repos,
    isLoading,
    error,
    fetchRepos,
  };
}
