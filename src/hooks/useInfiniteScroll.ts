import { useState, useCallback, useRef } from 'react';
import { Result } from '../domain/common/Result';

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface UseInfiniteScrollReturn<T> {
  data: T[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

/**
 * Custom hook for managing infinite scroll with pagination
 * 
 * Features:
 * - Pagination management
 * - Loading state management
 * - Error state management
 * - Data accumulation
 * - Refresh functionality
 * - Memory optimization
 */
export function useInfiniteScroll<T>(
  fetchData: (page: number, limit: number) => Promise<Result<PagedResult<T>>>,
  limit: number = 20
): UseInfiniteScrollReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to prevent stale closures
  const currentPageRef = useRef(0);
  const isLoadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  /**
   * Load more data for infinite scroll
   */
  const loadMore = useCallback(async () => {
    // Prevent multiple simultaneous requests
    if (isLoadingRef.current || !hasMoreRef.current) {
      return;
    }
    
    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);
    
    try {
      const page = currentPageRef.current;
      const result = await fetchData(page, limit);
      
      if (result.isSuccess) {
        const { items, hasMore: newHasMore } = result.value;
        
        setData(prev => {
          // Prevent duplicate items
          const existingIds = new Set(prev.map(item => (item as any).id?.value || (item as any).id));
          const newItems = items.filter(item => {
            const itemId = (item as any).id?.value || (item as any).id;
            return !existingIds.has(itemId);
          });
          return [...prev, ...newItems];
        });
        
        setHasMore(newHasMore);
        hasMoreRef.current = newHasMore;
        currentPageRef.current = page + 1;
      } else {
        setError(result.error);
        setHasMore(false);
        hasMoreRef.current = false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      setHasMore(false);
      hasMoreRef.current = false;
    } finally {
      isLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [fetchData, limit]);

  /**
   * Refresh data by resetting and loading first page
   */
  const refresh = useCallback(async () => {
    // Reset state
    setData([]);
    setError(null);
    setHasMore(true);
    currentPageRef.current = 0;
    hasMoreRef.current = true;
    isLoadingRef.current = false;
    
    // Load first page
    await loadMore();
  }, [loadMore]);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset hook to initial state
   */
  const reset = useCallback(() => {
    setData([]);
    setIsLoading(false);
    setHasMore(true);
    setError(null);
    currentPageRef.current = 0;
    hasMoreRef.current = true;
    isLoadingRef.current = false;
  }, []);

  return {
    data,
    isLoading,
    hasMore,
    error,
    loadMore,
    refresh,
    clearError,
    reset,
  };
}
