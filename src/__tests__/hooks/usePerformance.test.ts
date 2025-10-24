import { renderHook, act } from '@testing-library/react-native';
import { usePerformance } from '../../hooks/usePerformance';

// Mock performance API
let mockTime = 0;
const mockPerformance = {
  now: jest.fn(() => {
    mockTime += 50; // Increment by 50ms each call
    return mockTime;
  }),
  memory: {
    usedJSHeapSize: 50 * 1024 * 1024, // 50MB
  },
};

// Mock requestAnimationFrame
const mockRequestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
  setTimeout(callback, 16); // 60fps
  return 1;
});

const mockCancelAnimationFrame = jest.fn();

// Mock global performance
Object.defineProperty(global, 'performance', {
  value: mockPerformance,
  writable: true,
});

Object.defineProperty(global, 'requestAnimationFrame', {
  value: mockRequestAnimationFrame,
  writable: true,
});

Object.defineProperty(global, 'cancelAnimationFrame', {
  value: mockCancelAnimationFrame,
  writable: true,
});

describe('usePerformance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTime = 0; // Reset mock time
  });

  it('should initialize with default metrics', () => {
    const { result } = renderHook(() => usePerformance());

    expect(result.current.metrics).toEqual({
      renderTime: 0,
      memoryUsage: 50, // Fallback value for test environments
      frameRate: 0,
      bundleSize: 0,
    });
    expect(result.current.isPerformanceMonitoringEnabled).toBe(true);
  });

  it('should measure render time correctly', () => {
    const { result } = renderHook(() => usePerformance());

    let renderTime: number;

    act(() => {
      renderTime = result.current.measureRender('TestComponent', () => {
        // Simulate render work with a longer delay
        const start = Date.now();
        while (Date.now() - start < 50) {
          // Busy wait for 50ms
        }
      });
    });

    expect(renderTime).toBeGreaterThan(0);
    expect(result.current.metrics.renderTime).toBe(renderTime);
  });

  it('should measure async operations correctly', async () => {
    const { result } = renderHook(() => usePerformance());

    const asyncOperation = jest.fn().mockImplementation(async () => {
      // Simulate async work
      await new Promise(resolve => setTimeout(resolve, 50));
      return 'result';
    });
    
    const returnValue = await act(async () => {
      return await result.current.measureAsync('AsyncOperation', asyncOperation);
    });

    expect(returnValue).toBe('result');
    expect(asyncOperation).toHaveBeenCalledTimes(1);
    expect(result.current.metrics.renderTime).toBeGreaterThan(0);
  });

  it('should handle async operation errors', async () => {
    const { result } = renderHook(() => usePerformance());

    const asyncOperation = jest.fn().mockRejectedValue(new Error('Async error'));

    await expect(
      act(async () => {
        await result.current.measureAsync('AsyncOperation', asyncOperation);
      })
    ).rejects.toThrow('Async error');

    expect(asyncOperation).toHaveBeenCalledTimes(1);
  });

  it('should track performance entries', () => {
    const { result } = renderHook(() => usePerformance());

    act(() => {
      result.current.startMeasurement('TestMeasurement');
      // Simulate some work with longer delay
      const start = Date.now();
      while (Date.now() - start < 50) {
        // Busy wait for 50ms
      }
      result.current.endMeasurement('TestMeasurement');
    });

    const entries = result.current.getPerformanceEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0].name).toBe('TestMeasurement');
    expect(entries[0].duration).toBeGreaterThan(0);
  });

  it('should clear metrics correctly', () => {
    const { result } = renderHook(() => usePerformance());

    // Add some measurements
    act(() => {
      result.current.measureRender('TestComponent', () => {});
    });

    expect(result.current.getPerformanceEntries().length).toBeGreaterThan(0);

    // Clear metrics
    act(() => {
      result.current.clearMetrics();
    });

    expect(result.current.metrics).toEqual({
      renderTime: 0,
      memoryUsage: 0,
      frameRate: 0,
      bundleSize: 0,
    });
    expect(result.current.getPerformanceEntries()).toHaveLength(0);
  });

  it('should handle startMeasurement without endMeasurement', () => {
    const { result } = renderHook(() => usePerformance());

    act(() => {
      result.current.startMeasurement('TestMeasurement');
    });

    let duration: number;
    act(() => {
      duration = result.current.endMeasurement('TestMeasurement');
    });

    expect(duration!).toBeGreaterThan(0);
  });

  it('should handle endMeasurement without startMeasurement', () => {
    const { result } = renderHook(() => usePerformance());

    let duration: number;
    act(() => {
      duration = result.current.endMeasurement('NonExistentMeasurement');
    });

    expect(duration!).toBe(0);
  });

  it('should limit performance entries to 100', () => {
    const { result } = renderHook(() => usePerformance());

    // Add 101 measurements
    for (let i = 0; i < 101; i++) {
      act(() => {
        result.current.startMeasurement(`Measurement${i}`);
        result.current.endMeasurement(`Measurement${i}`);
      });
    }

    const entries = result.current.getPerformanceEntries();
    expect(entries).toHaveLength(100);
    // Should keep the last 100 entries
    expect(entries[0].name).toBe('Measurement1');
    expect(entries[99].name).toBe('Measurement100');
  });

  it('should monitor memory usage', () => {
    const { result } = renderHook(() => usePerformance());

    // Memory usage should be monitored
    expect(result.current.metrics.memoryUsage).toBe(50); // 50MB
  });

  it('should handle missing performance.memory gracefully', () => {
    // Mock performance without memory
    const mockPerformanceWithoutMemory = {
      now: jest.fn(() => Date.now()),
    };

    Object.defineProperty(global, 'performance', {
      value: mockPerformanceWithoutMemory,
      writable: true,
    });

    const { result } = renderHook(() => usePerformance());

    expect(result.current.metrics.memoryUsage).toBe(50); // Fallback value for test environments
  });

  it('should measure frame rate', (done) => {
    const { result } = renderHook(() => usePerformance());

    // Wait for frame rate measurement
    setTimeout(() => {
      expect(result.current.metrics.frameRate).toBeGreaterThan(0);
      done();
    }, 100);
  });

  it('should handle disabled performance monitoring', () => {
    const { result } = renderHook(() => usePerformance());

    // Disable monitoring
    act(() => {
      // This would be set internally when monitoring is disabled
      (result.current as any).isPerformanceMonitoringEnabled = false;
    });

    let renderTime: number;
    act(() => {
      renderTime = result.current.measureRender('TestComponent', () => {});
    });

    expect(renderTime!).toBe(0);
  });
});
