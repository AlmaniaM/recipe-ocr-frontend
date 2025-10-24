/**
 * API Types and Interfaces
 * 
 * Defines all types, interfaces, and enums used for API communication
 * between the frontend and backend services.
 */

// Base API Response
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  success: boolean;
}

// Paginated Response
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// API Error Response
export interface ApiError {
  error: string;
  details?: string;
  code?: string;
  timestamp?: string;
}

// API Configuration
export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  headers?: Record<string, string>;
}

// Request Options
export interface RequestOptions {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

// HTTP Methods
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API Endpoints
export const API_ENDPOINTS = {
  RECIPES: {
    BASE: '/api/recipes',
    BY_ID: (id: string) => `/api/recipes/${id}`,
    SEARCH: '/api/recipes/search',
    ADVANCED_SEARCH: '/api/recipes/search/advanced',
    COUNT: '/api/recipes/count',
    OCR: '/api/recipes/ocr',
    PARSE: '/api/recipes/parse',
    TAGS: '/api/recipes/tags',
  },
  RECIPE_BOOKS: {
    BASE: '/api/recipe-books',
    BY_ID: (id: string) => `/api/recipe-books/${id}`,
    RECIPES: (id: string) => `/api/recipe-books/${id}/recipes`,
  },
  EXPORT: {
    RECIPE: (id: string) => `/api/export/recipe/${id}`,
    RECIPE_BOOK: (id: string) => `/api/export/book/${id}`,
  },
} as const;

// API Status Codes
export enum ApiStatus {
  SUCCESS = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  SERVICE_UNAVAILABLE = 503,
}

// API Error Types
export enum ApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// Custom API Error Class
export class ApiError extends Error {
  constructor(
    public type: ApiErrorType,
    message: string,
    public statusCode?: number,
    public details?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Advanced Search Types
export interface AdvancedSearchRequest {
  searchText?: string;
  category?: string;
  tags?: string[];
  minPrepTime?: number;
  maxPrepTime?: number;
  minCookTime?: number;
  maxCookTime?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'Ascending' | 'Descending';
}

export interface AdvancedSearchResponse {
  items: any[]; // Will be RecipeDto[]
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Tag Management Types
export interface TagDto {
  id: string;
  name: string;
  description?: string;
  color?: string;
  recipeCount: number;
}

export interface CreateTagRequest {
  name: string;
  color?: string;
}

export interface CreateTagResponse {
  id: string;
  name: string;
}

export interface GetTagsRequest {
  search?: string;
}

export interface GetTagsResponse {
  tags: TagDto[];
}
