/**
 * Base API Client Tests
 * 
 * Comprehensive unit tests for the BaseApiClient class
 * including retry logic, error handling, and HTTP operations.
 */

import { BaseApiClient, FetchHttpClient } from '../BaseApiClient';
import { ApiError, ApiErrorType, RequestOptions, HttpMethod } from '../types';

// Mock fetch for testing
global.fetch = jest.fn();

describe('FetchHttpClient', () => {
  let httpClient: FetchHttpClient;

  beforeEach(() => {
    httpClient = new FetchHttpClient();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('request', () => {
    it('should make successful GET request', async () => {
      const mockResponse = { data: 'test' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockResponse),
      });

      const result = await httpClient.request('GET', '/test');

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/test', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: undefined,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should make successful POST request with data', async () => {
      const mockData = { name: 'test' };
      const mockResponse = { id: 1, ...mockData };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        headers: new Map([['content-type', 'application/json']]),
        json: () => Promise.resolve(mockResponse),
      });

      const result = await httpClient.request('POST', '/test', mockData);

      expect(global.fetch).toHaveBeenCalledWith('http://localhost:5000/api/test', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockData),
        signal: undefined,
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle HTTP error responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(httpClient.request('GET', '/test')).rejects.toThrow(ApiError);
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(httpClient.request('GET', '/test')).rejects.toThrow(ApiError);
    });

    it('should handle abort signal', async () => {
      const abortController = new AbortController();
      abortController.abort();

      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('AbortError'));

      await expect(httpClient.request('GET', '/test', undefined, {
        signal: abortController.signal,
      })).rejects.toThrow(ApiError);
    });
  });

  describe('getErrorType', () => {
    it('should return correct error types for different status codes', () => {
      const httpClient = new FetchHttpClient();
      
      // Access private method for testing
      const getErrorType = (httpClient as any).getErrorType.bind(httpClient);
      
      expect(getErrorType(400)).toBe(ApiErrorType.VALIDATION_ERROR);
      expect(getErrorType(401)).toBe(ApiErrorType.AUTHENTICATION_ERROR);
      expect(getErrorType(403)).toBe(ApiErrorType.AUTHORIZATION_ERROR);
      expect(getErrorType(404)).toBe(ApiErrorType.NOT_FOUND_ERROR);
      expect(getErrorType(500)).toBe(ApiErrorType.SERVER_ERROR);
      expect(getErrorType(999)).toBe(ApiErrorType.UNKNOWN_ERROR);
    });
  });
});

describe('BaseApiClient', () => {
  let apiClient: BaseApiClient;
  let mockHttpClient: jest.Mocked<FetchHttpClient>;

  beforeEach(() => {
    mockHttpClient = {
      request: jest.fn(),
    } as any;
    
    apiClient = new (class extends BaseApiClient {
      constructor() {
        super(mockHttpClient);
      }
    })();
  });

  describe('request', () => {
    it('should retry failed requests', async () => {
      const mockError = new ApiError(ApiErrorType.SERVER_ERROR, 'Server error', 500);
      mockHttpClient.request
        .mockRejectedValueOnce(mockError)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce({ data: 'success' });

      const result = await (apiClient as any).request('GET', '/test');

      expect(mockHttpClient.request).toHaveBeenCalledTimes(3);
      expect(result).toEqual({ data: 'success' });
    });

    it('should not retry validation errors', async () => {
      const mockError = new ApiError(ApiErrorType.VALIDATION_ERROR, 'Validation error', 400);
      mockHttpClient.request.mockRejectedValueOnce(mockError);

      await expect((apiClient as any).request('GET', '/test')).rejects.toThrow(ApiError);
      expect(mockHttpClient.request).toHaveBeenCalledTimes(1);
    });

    it('should not retry authentication errors', async () => {
      const mockError = new ApiError(ApiErrorType.AUTHENTICATION_ERROR, 'Auth error', 401);
      mockHttpClient.request.mockRejectedValueOnce(mockError);

      await expect((apiClient as any).request('GET', '/test')).rejects.toThrow(ApiError);
      expect(mockHttpClient.request).toHaveBeenCalledTimes(1);
    });

    it('should respect custom retry attempts', async () => {
      const mockError = new ApiError(ApiErrorType.SERVER_ERROR, 'Server error', 500);
      mockHttpClient.request.mockRejectedValue(mockError);

      await expect((apiClient as any).request('GET', '/test', undefined, { retries: 1 }))
        .rejects.toThrow(ApiError);
      expect(mockHttpClient.request).toHaveBeenCalledTimes(2);
    });
  });

  describe('HTTP methods', () => {
    beforeEach(() => {
      mockHttpClient.request.mockResolvedValue({ data: 'success' });
    });

    it('should make GET request', async () => {
      await (apiClient as any).get('/test');
      expect(mockHttpClient.request).toHaveBeenCalledWith('GET', '/test', undefined, undefined);
    });

    it('should make POST request with data', async () => {
      const data = { name: 'test' };
      await (apiClient as any).post('/test', data);
      expect(mockHttpClient.request).toHaveBeenCalledWith('POST', '/test', data, undefined);
    });

    it('should make PUT request with data', async () => {
      const data = { name: 'test' };
      await (apiClient as any).put('/test', data);
      expect(mockHttpClient.request).toHaveBeenCalledWith('PUT', '/test', data, undefined);
    });

    it('should make DELETE request', async () => {
      await (apiClient as any).delete('/test');
      expect(mockHttpClient.request).toHaveBeenCalledWith('DELETE', '/test', undefined, undefined);
    });

    it('should make PATCH request with data', async () => {
      const data = { name: 'test' };
      await (apiClient as any).patch('/test', data);
      expect(mockHttpClient.request).toHaveBeenCalledWith('PATCH', '/test', data, undefined);
    });
  });

  describe('buildQueryString', () => {
    it('should build query string from params', () => {
      const params = { page: 1, size: 10, search: 'test' };
      const result = (apiClient as any).buildQueryString(params);
      expect(result).toBe('?page=1&size=10&search=test');
    });

    it('should handle array values', () => {
      const params = { tags: ['tag1', 'tag2'], page: 1 };
      const result = (apiClient as any).buildQueryString(params);
      expect(result).toBe('?tags=tag1&tags=tag2&page=1');
    });

    it('should filter out undefined and null values', () => {
      const params = { page: 1, size: undefined, search: null, filter: 'active' };
      const result = (apiClient as any).buildQueryString(params);
      expect(result).toBe('?page=1&filter=active');
    });

    it('should return empty string for empty params', () => {
      const result = (apiClient as any).buildQueryString({});
      expect(result).toBe('');
    });
  });

  describe('handleApiError', () => {
    it('should re-throw ApiError', () => {
      const apiError = new ApiError(ApiErrorType.VALIDATION_ERROR, 'Test error');
      expect(() => (apiClient as any).handleApiError(apiError)).toThrow(apiError);
    });

    it('should wrap Error in ApiError', () => {
      const error = new Error('Test error');
      expect(() => (apiClient as any).handleApiError(error)).toThrow(ApiError);
    });

    it('should handle unknown errors', () => {
      expect(() => (apiClient as any).handleApiError('unknown')).toThrow(ApiError);
    });
  });
});
