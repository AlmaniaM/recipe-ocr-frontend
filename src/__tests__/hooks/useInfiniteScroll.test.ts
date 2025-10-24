import { renderHook, act } from '@testing-library/react-native';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { Result } from '../../domain/common/Result';

// Mock data
interface MockItem {
  id: string;
  name: string;
}

const mockItems: MockItem[] = Array.from({ length: 20 }, (_, i) => ({
  id: `item-${i}`,
  name: `Item ${i}`,
}));

const mockPagedResult = {
  items: mockItems,
  totalCount: 100,
  page: 0,
  limit: 20,
  hasMore: true,
};

describe('useInfiniteScroll', () => {
  const mockFetchData = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchData.mockResolvedValue(Result.success(mockPagedResult));
  });

  it('should initialize with empty data', () => {
    const { result } = renderHook(() => useInfiniteScroll(mockFetchData, 20));

    expect(result.current.data).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should load more data when loadMore is called', async () => {
    const { result } = renderHook(() => useInfiniteScroll(mockFetchData, 20));

    await act(async () => {
      await result.current.loadMore();
    });

    expect(mockFetchData).toHaveBeenCalledWith(0, 20);
    expect(result.current.data).toEqual(mockItems);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle multiple loadMore calls', async () => {
    const { result } = renderHook(() => useInfiniteScroll(mockFetchData, 20));

    // First load
    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.data).toEqual(mockItems);

    // Second load
    await act(async () => {
      await result.current.loadMore();
    });

    expect(mockFetchData).toHaveBeenCalledTimes(2);
    expect(mockFetchData).toHaveBeenNthCalledWith(1, 0, 20);
    expect(mockFetchData).toHaveBeenNthCalledWith(2, 1, 20);
    expect(result.current.data).toEqual([...mockItems, ...mockItems]);
  });

  it('should handle errors gracefully', async () => {
    const errorMessage = 'Failed to fetch data';
    mockFetchData.mockResolvedValue(Result.failure(errorMessage));

    const { result } = renderHook(() => useInfiniteScroll(mockFetchData, 20));

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle refresh correctly', async () => {
    const { result } = renderHook(() => useInfiniteScroll(mockFetchData, 20));

    // Load some data first
    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.data).toEqual(mockItems);

    // Refresh
    await act(async () => {
      await result.current.refresh();
    });

    expect(mockFetchData).toHaveBeenCalledWith(0, 20);
    expect(result.current.data).toEqual(mockItems);
    expect(result.current.error).toBeNull();
  });

  it('should prevent multiple simultaneous loadMore calls', async () => {
    const { result } = renderHook(() => useInfiniteScroll(mockFetchData, 20));

    // Start multiple loadMore calls simultaneously
    const promises = [
      result.current.loadMore(),
      result.current.loadMore(),
      result.current.loadMore(),
    ];

    await act(async () => {
      await Promise.all(promises);
    });

    // Should only call fetchData once
    expect(mockFetchData).toHaveBeenCalledTimes(1);
  });

  it('should handle hasMore correctly', async () => {
    const noMoreDataResult = {
      ...mockPagedResult,
      items: mockItems.slice(0, 10),
      hasMore: false,
    };

    mockFetchData.mockResolvedValue(Result.success(noMoreDataResult));

    const { result } = renderHook(() => useInfiniteScroll(mockFetchData, 20));

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.hasMore).toBe(false);
    expect(result.current.data).toEqual(noMoreDataResult.items);
  });

  it('should clear error when clearError is called', async () => {
    const errorMessage = 'Failed to fetch data';
    mockFetchData.mockResolvedValue(Result.failure(errorMessage));

    const { result } = renderHook(() => useInfiniteScroll(mockFetchData, 20));

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.error).toBe(errorMessage);

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should reset to initial state when reset is called', async () => {
    const { result } = renderHook(() => useInfiniteScroll(mockFetchData, 20));

    // Load some data
    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.data).toEqual(mockItems);

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.hasMore).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should handle async errors', async () => {
    const errorMessage = 'Network error';
    mockFetchData.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useInfiniteScroll(mockFetchData, 20));

    await act(async () => {
      await result.current.loadMore();
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('should prevent duplicate items when loading more', async () => {
    const duplicateItems = [...mockItems, ...mockItems];
    mockFetchData.mockResolvedValue(Result.success({
      ...mockPagedResult,
      items: duplicateItems,
    }));

    const { result } = renderHook(() => useInfiniteScroll(mockFetchData, 20));

    await act(async () => {
      await result.current.loadMore();
    });

    // Should not have duplicates
    const uniqueIds = new Set(result.current.data.map(item => (item as any).id));
    expect(uniqueIds.size).toBe(mockItems.length);
  });
});
