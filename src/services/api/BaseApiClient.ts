/**
 * Base API Client
 * 
 * Provides common functionality for all API clients including
 * HTTP request handling, error management, retry logic, and response processing.
 */

import { ApiConfig, ApiError, ApiErrorType, RequestOptions, HttpMethod } from './types';
import { apiConfigManager } from './config';

export interface HttpClient {
  request<T>(
    method: HttpMethod,
    url: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T>;
}

// Default HTTP Client implementation using fetch
export class FetchHttpClient implements HttpClient {
  async request<T>(
    method: HttpMethod,
    url: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    const config = apiConfigManager.getConfig();
    const fullUrl = url.startsWith('http') ? url : `${config.baseUrl}${url}`;
    
    const requestOptions: RequestInit = {
      method,
      headers: {
        ...config.headers,
        ...options?.headers,
      },
      signal: options?.signal,
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      requestOptions.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(fullUrl, requestOptions);
      
      if (!response.ok) {
        throw new ApiError(
          this.getErrorType(response.status),
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text() as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError(ApiErrorType.TIMEOUT_ERROR, 'Request was aborted');
        }
        throw new ApiError(ApiErrorType.NETWORK_ERROR, error.message);
      }
      
      throw new ApiError(ApiErrorType.UNKNOWN_ERROR, 'An unknown error occurred');
    }
  }

  private getErrorType(statusCode: number): ApiErrorType {
    switch (statusCode) {
      case 400:
        return ApiErrorType.VALIDATION_ERROR;
      case 401:
        return ApiErrorType.AUTHENTICATION_ERROR;
      case 403:
        return ApiErrorType.AUTHORIZATION_ERROR;
      case 404:
        return ApiErrorType.NOT_FOUND_ERROR;
      case 500:
      case 502:
      case 503:
      case 504:
        return ApiErrorType.SERVER_ERROR;
      default:
        return ApiErrorType.UNKNOWN_ERROR;
    }
  }
}

// Base API Client with retry logic and common functionality
export abstract class BaseApiClient {
  protected httpClient: HttpClient;
  protected config: ApiConfig;

  constructor(httpClient?: HttpClient) {
    this.httpClient = httpClient || new FetchHttpClient();
    this.config = apiConfigManager.getConfig();
  }

  protected async request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: any,
    options?: RequestOptions
  ): Promise<T> {
    const retryAttempts = options?.retries ?? this.config.retryAttempts;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retryAttempts; attempt++) {
      try {
        return await this.httpClient.request<T>(method, endpoint, data, options);
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on certain error types
        if (error instanceof ApiError) {
          if (
            error.type === ApiErrorType.VALIDATION_ERROR ||
            error.type === ApiErrorType.AUTHENTICATION_ERROR ||
            error.type === ApiErrorType.AUTHORIZATION_ERROR ||
            error.type === ApiErrorType.NOT_FOUND_ERROR
          ) {
            throw error;
          }
        }

        // If this is the last attempt, throw the error
        if (attempt === retryAttempts) {
          throw lastError;
        }

        // Wait before retrying
        await this.delay(this.config.retryDelay * Math.pow(2, attempt));
      }
    }

    throw lastError || new ApiError(ApiErrorType.UNKNOWN_ERROR, 'Request failed after all retry attempts');
  }

  public async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  public async post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>('POST', endpoint, data, options);
  }

  public async put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  public async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  public async patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, options);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  protected buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, String(item)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  protected handleApiError(error: unknown): never {
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof Error) {
      throw new ApiError(ApiErrorType.UNKNOWN_ERROR, error.message);
    }
    
    throw new ApiError(ApiErrorType.UNKNOWN_ERROR, 'An unknown error occurred');
  }
}
