import { useState, useEffect } from 'react';
import apiClient from '../api/client';

/**
 * Hook for managing calendar events and navigation
 * @param {number} days - Number of days to fetch (default: 7)
 * @returns {Object} Calendar state and methods
 */
export function useCalendar(days = 7) {
  const [events, setEvents] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(getMonday(new Date()));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch events whenever currentWeek changes
  useEffect(() => {
    fetchEvents();
  }, [currentWeek]);

  async function fetchEvents() {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get(`/calendar?days=${days}`);
      setEvents(response.events || []);
    } catch (err) {
      console.error('Failed to fetch calendar events:', err);
      setError(err.message);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }

  function nextWeek() {
    const next = new Date(currentWeek);
    next.setDate(next.getDate() + 7);
    setCurrentWeek(getMonday(next));
  }

  function prevWeek() {
    const prev = new Date(currentWeek);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeek(getMonday(prev));
  }

  function today() {
    setCurrentWeek(getMonday(new Date()));
  }

  return {
    events,
    currentWeek,
    isLoading,
    error,
    nextWeek,
    prevWeek,
    today,
    refetch: fetchEvents,
  };
}

/**
 * Helper function to get the Monday of the week for a given date
 */
function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}
