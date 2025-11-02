import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

/**
 * Hook for accessing authentication state and methods
 * @returns {Object} Authentication state and methods
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
