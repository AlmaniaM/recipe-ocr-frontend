import { renderHook, act } from '@testing-library/react-native';
import { useLoadingState } from '../../hooks/useLoadingState';
import { Result } from '../../domain/common/Result';

describe('useLoadingState', () => {
  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useLoadingState());
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should execute async operation successfully', async () => {
    const { result } = renderHook(() => useLoadingState());
    
    const mockOperation = jest.fn().mockResolvedValue('success');
    
    let operationResult: Result<string>;
    
    await act(async () => {
      operationResult = await result.current.executeWithLoading(mockOperation);
    });
    
    expect(operationResult!.isSuccess).toBe(true);
    expect(operationResult!.value).toBe('success');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(mockOperation).toHaveBeenCalledTimes(1);
  });

  it('should handle async operation failure', async () => {
    const { result } = renderHook(() => useLoadingState());
    
    const mockError = new Error('Operation failed');
    const mockOperation = jest.fn().mockRejectedValue(mockError);
    
    let operationResult: Result<string>;
    
    await act(async () => {
      operationResult = await result.current.executeWithLoading(mockOperation);
    });
    
    expect(operationResult!.isFailure).toBe(true);
    expect(operationResult!.error).toBe('Operation failed');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Operation failed');
  });

  it('should use custom error message when provided', async () => {
    const { result } = renderHook(() => useLoadingState());
    
    const mockError = new Error('Original error');
    const mockOperation = jest.fn().mockRejectedValue(mockError);
    const customErrorMessage = 'Custom error message';
    
    let operationResult: Result<string>;
    
    await act(async () => {
      operationResult = await result.current.executeWithLoading(mockOperation, customErrorMessage);
    });
    
    expect(operationResult!.isFailure).toBe(true);
    expect(operationResult!.error).toBe(customErrorMessage);
    expect(result.current.error).toBe(customErrorMessage);
  });

  it('should set loading state during operation', async () => {
    const { result } = renderHook(() => useLoadingState());
    
    let resolveOperation: (value: string) => void;
    const mockOperation = jest.fn().mockImplementation(
      () => new Promise<string>((resolve) => {
        resolveOperation = resolve;
      })
    );
    
    // Start the operation
    let operationPromise: Promise<Result<string>>;
    act(() => {
      operationPromise = result.current.executeWithLoading(mockOperation);
    });
    
    // Check loading state is true
    expect(result.current.isLoading).toBe(true);
    
    // Complete the operation
    await act(async () => {
      resolveOperation!('success');
      await operationPromise!;
    });
    
    // Check loading state is false
    expect(result.current.isLoading).toBe(false);
  });

  it('should clear error when clearError is called', () => {
    const { result } = renderHook(() => useLoadingState());
    
    act(() => {
      result.current.setError('Some error');
    });
    
    expect(result.current.error).toBe('Some error');
    
    act(() => {
      result.current.clearError();
    });
    
    expect(result.current.error).toBe(null);
  });

  it('should set loading state manually', () => {
    const { result } = renderHook(() => useLoadingState());
    
    act(() => {
      result.current.setLoading(true);
    });
    
    expect(result.current.isLoading).toBe(true);
    
    act(() => {
      result.current.setLoading(false);
    });
    
    expect(result.current.isLoading).toBe(false);
  });

  it('should set error state manually', () => {
    const { result } = renderHook(() => useLoadingState());
    
    act(() => {
      result.current.setError('Manual error');
    });
    
    expect(result.current.error).toBe('Manual error');
    
    act(() => {
      result.current.setError(null);
    });
    
    expect(result.current.error).toBe(null);
  });

  it('should handle non-Error exceptions', async () => {
    const { result } = renderHook(() => useLoadingState());
    
    const mockOperation = jest.fn().mockRejectedValue('String error');
    
    let operationResult: Result<string>;
    
    await act(async () => {
      operationResult = await result.current.executeWithLoading(mockOperation);
    });
    
    expect(operationResult!.isFailure).toBe(true);
    expect(operationResult!.error).toBe('An unexpected error occurred');
    expect(result.current.error).toBe('An unexpected error occurred');
  });

  it('should handle multiple operations sequentially', async () => {
    const { result } = renderHook(() => useLoadingState());
    
    const mockOperation1 = jest.fn().mockResolvedValue('result1');
    const mockOperation2 = jest.fn().mockResolvedValue('result2');
    
    let result1: Result<string>;
    let result2: Result<string>;
    
    await act(async () => {
      result1 = await result.current.executeWithLoading(mockOperation1);
    });
    
    await act(async () => {
      result2 = await result.current.executeWithLoading(mockOperation2);
    });
    
    expect(result1!.isSuccess).toBe(true);
    expect(result1!.value).toBe('result1');
    expect(result2!.isSuccess).toBe(true);
    expect(result2!.value).toBe('result2');
    expect(mockOperation1).toHaveBeenCalledTimes(1);
    expect(mockOperation2).toHaveBeenCalledTimes(1);
  });
});
