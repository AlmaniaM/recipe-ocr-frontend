/**
 * Test Configuration for Image Sync Tests
 * 
 * Provides configuration and setup for all image sync related tests
 */

import { configure } from '@testing-library/react-native';

// Configure testing library
configure({
  asyncUtilTimeout: 10000, // 10 seconds timeout for async operations
  getElementError: (message, container) => {
    const error = new Error(message);
    error.name = 'TestingLibraryElementError';
    error.stack = null;
    return error;
  },
});

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') || args[0].includes('Error:'))
    ) {
      return;
    }
    originalConsoleError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning:')
    ) {
      return;
    }
    originalConsoleWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test setup
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset timers
  jest.useRealTimers();
});

afterEach(() => {
  // Clean up after each test
  jest.clearAllMocks();
  jest.clearAllTimers();
});

// Test utilities
export const testUtils = {
  /**
   * Wait for async operations to complete
   */
  waitFor: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Create a mock function with default implementation
   */
  createMockFunction: <T extends (...args: any[]) => any>(
    implementation?: T
  ): jest.MockedFunction<T> => {
    return jest.fn(implementation) as jest.MockedFunction<T>;
  },

  /**
   * Create a mock object with default values
   */
  createMockObject: <T extends Record<string, any>>(
    defaults: Partial<T> = {}
  ): jest.Mocked<T> => {
    return defaults as jest.Mocked<T>;
  },

  /**
   * Assert that a function throws an error
   */
  expectToThrow: async (fn: () => Promise<any>, errorMessage?: string) => {
    try {
      await fn();
      throw new Error('Expected function to throw');
    } catch (error) {
      if (errorMessage) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain(errorMessage);
      }
    }
  },

  /**
   * Assert that a function does not throw an error
   */
  expectNotToThrow: async (fn: () => Promise<any>) => {
    try {
      await fn();
    } catch (error) {
      throw new Error(`Expected function not to throw, but it threw: ${error}`);
    }
  }
};

// Test constants
export const TEST_CONSTANTS = {
  TIMEOUTS: {
    SHORT: 1000,
    MEDIUM: 5000,
    LONG: 10000,
    VERY_LONG: 30000
  },
  
  LIMITS: {
    MAX_RETRIES: 3,
    BATCH_SIZE: 10,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    CACHE_EXPIRY: 24 * 60 * 60 * 1000 // 24 hours
  },
  
  PATHS: {
    TEST_IMAGES: 'file://test-images/',
    TEST_RECIPES: 'recipe-',
    TEST_STORAGE: 'test-storage/'
  },
  
  MIME_TYPES: {
    JPEG: 'image/jpeg',
    PNG: 'image/png',
    WEBP: 'image/webp',
    GIF: 'image/gif'
  }
};

// Test data generators
export const testDataGenerators = {
  /**
   * Generate a random string of specified length
   */
  randomString: (length: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * Generate a random number between min and max
   */
  randomNumber: (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * Generate a random date between start and end
   */
  randomDate: (start: Date, end: Date): Date => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  },

  /**
   * Generate a random file name
   */
  randomFileName: (): string => {
    const timestamp = Date.now();
    const random = testDataGenerators.randomString(8);
    return `test-image_${timestamp}_${random}.jpg`;
  },

  /**
   * Generate a random recipe ID
   */
  randomRecipeId: (): string => {
    const random = testDataGenerators.randomString(8);
    return `recipe-${random}`;
  },

  /**
   * Generate a random image URI
   */
  randomImageUri: (): string => {
    const fileName = testDataGenerators.randomFileName();
    return `file://test-images/${fileName}`;
  }
};

// Performance testing utilities
export const performanceUtils = {
  /**
   * Measure execution time of a function
   */
  measureTime: async <T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> => {
    const start = Date.now();
    const result = await fn();
    const duration = Date.now() - start;
    return { result, duration };
  },

  /**
   * Assert that a function executes within a specified time limit
   */
  assertExecutionTime: async <T>(
    fn: () => Promise<T>,
    maxDuration: number
  ): Promise<T> => {
    const { result, duration } = await performanceUtils.measureTime(fn);
    expect(duration).toBeLessThan(maxDuration);
    return result;
  }
};

// Error testing utilities
export const errorUtils = {
  /**
   * Create a mock error with specific properties
   */
  createMockError: (message: string, code?: string): Error => {
    const error = new Error(message);
    if (code) {
      (error as any).code = code;
    }
    return error;
  },

  /**
   * Assert that an error has specific properties
   */
  assertErrorProperties: (error: Error, expectedProperties: Record<string, any>) => {
    expect(error).toBeInstanceOf(Error);
    Object.entries(expectedProperties).forEach(([key, value]) => {
      expect((error as any)[key]).toBe(value);
    });
  }
};

// Mock data utilities
export const mockDataUtils = {
  /**
   * Create mock image sync record
   */
  createMockImageSyncRecord: (overrides: any = {}) => ({
    localUri: 'file://test-image.jpg',
    fileName: 'test-image_20231201120000_12345678.jpg',
    recipeId: 'recipe-123',
    isSynced: false,
    lastChecked: new Date(),
    hasError: false,
    retryCount: 0,
    fileSize: 1024,
    contentType: 'image/jpeg',
    ...overrides
  }),

  /**
   * Create mock sync status
   */
  createMockSyncStatus: (overrides: any = {}) => ({
    totalImages: 0,
    syncedImages: 0,
    pendingImages: 0,
    failedImages: 0,
    syncingImages: 0,
    syncPercentage: 0,
    lastSyncAt: undefined,
    isSyncing: false,
    ...overrides
  }),

  /**
   * Create mock API response
   */
  createMockApiResponse: (data: any, status: number = 200) => ({
    data,
    status,
    statusText: 'OK',
    headers: {},
    config: {}
  })
};
