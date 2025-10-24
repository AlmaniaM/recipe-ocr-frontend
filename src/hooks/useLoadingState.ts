import { useState, useCallback } from 'react';
import { Result } from '../domain/common/Result';

export interface UseLoadingStateReturn {
  isLoading: boolean;
  error: string | null;
  executeWithLoading: <T>(
    operation: () => Promise<T>,
    errorMessage?: string
  ) => Promise<Result<T>>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

/**
 * Custom hook for managing loading states and error handling
 * Provides utilities for executing async operations with loading states
 * and error management using the Result pattern
 */
export const useLoadingState = (): UseLoadingStateReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Executes an async operation with loading state management
   * @param operation - The async operation to execute
   * @param errorMessage - Optional custom error message
   * @returns Promise<Result<T>> - Result containing success/failure state
   */
  const executeWithLoading = useCallback(async <T>(
    operation: () => Promise<T>,
    errorMessage?: string
  ): Promise<Result<T>> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await operation();
      return Result.success(result);
    } catch (err) {
      const errorMsg = errorMessage || (err instanceof Error ? err.message : 'An unexpected error occurred');
      setError(errorMsg);
      return Result.failure<T>(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clears the current error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Manually set loading state
   * @param loading - The loading state to set
   */
  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  /**
   * Manually set error state
   * @param error - The error message to set (null to clear)
   */
  const setErrorState = useCallback((error: string | null) => {
    setError(error);
  }, []);

  return {
    isLoading,
    error,
    executeWithLoading,
    clearError,
    setLoading,
    setError: setErrorState,
  };
};

export default useLoadingState;
