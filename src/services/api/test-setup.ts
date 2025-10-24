/**
 * API Tests Setup
 * 
 * Configuration and setup for API tests including
 * mocks, environment variables, and test utilities.
 */

// import 'react-native-url-polyfill/auto'; // Commented out to avoid module resolution issues

// Mock environment variables
process.env.EXPO_PUBLIC_API_BASE_URL = 'http://localhost:5000/api';
process.env.EXPO_PUBLIC_USE_MOCK_OCR = 'true';
process.env.EXPO_PUBLIC_USE_MOCK_PARSER = 'true';

// Mock fetch globally
global.fetch = jest.fn();

// Mock FileReader for base64 conversion tests
const mockFileReader = {
  readAsDataURL: jest.fn(),
  result: 'data:image/jpeg;base64,testdata',
  onloadend: null,
  onerror: null,
  EMPTY: 0,
  LOADING: 1,
  DONE: 2,
};

global.FileReader = jest.fn().mockImplementation(() => mockFileReader) as any;

// Mock Blob for file handling tests
global.Blob = jest.fn().mockImplementation((content, options) => ({
  content,
  options,
  type: options?.type || 'application/octet-stream',
}));

// Mock URL.createObjectURL for file URL generation
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn(),
};

// Test utilities
export const createMockApiResponse = <T>(data: T, status: number = 200) => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: status === 200 ? 'OK' : 'Error',
  headers: new Map([['content-type', 'application/json']]),
  json: () => Promise.resolve(data),
  text: () => Promise.resolve(JSON.stringify(data)),
  blob: () => Promise.resolve(new Blob([JSON.stringify(data)])),
});

export const createMockApiError = (status: number, message: string) => {
  const error = new Error(message);
  (error as any).status = status;
  (error as any).statusText = message;
  return error;
};

export const mockFetchSuccess = <T>(data: T, status: number = 200) => {
  (global.fetch as jest.Mock).mockResolvedValue(createMockApiResponse(data, status));
};

export const mockFetchError = (status: number, message: string) => {
  (global.fetch as jest.Mock).mockRejectedValue(createMockApiError(status, message));
};

export const mockFetchNetworkError = () => {
  (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
};

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  (global.fetch as jest.Mock).mockClear();
});

// Clean up after each test
afterEach(() => {
  jest.restoreAllMocks();
});
