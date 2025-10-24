/**
 * API Configuration
 * 
 * Centralized configuration for API services including base URLs,
 * timeouts, retry policies, and environment-specific settings.
 */

import { ApiConfig } from './types';

// Environment configuration
const getApiBaseUrl = (): string => {
  // Check for Expo environment variable first
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  
  // Development defaults
  if (__DEV__) {
    // For iOS Simulator
    if (process.env.EXPO_PUBLIC_PLATFORM === 'ios') {
      return 'http://localhost:5000/api';
    }
    // For Android Emulator
    if (process.env.EXPO_PUBLIC_PLATFORM === 'android') {
      return 'http://10.0.2.2:5000/api';
    }
    // For web
    return 'http://localhost:5000/api';
  }
  
  // Production URL (replace with your actual production URL)
  return 'https://api.recipe-ocr.com/api';
};

// Default API configuration
export const defaultApiConfig: ApiConfig = {
  baseUrl: getApiBaseUrl(),
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// Environment-specific configurations
export const apiConfigs = {
  development: {
    ...defaultApiConfig,
    timeout: 60000, // Longer timeout for development
    retryAttempts: 2,
  },
  production: {
    ...defaultApiConfig,
    timeout: 15000, // Shorter timeout for production
    retryAttempts: 3,
  },
  test: {
    ...defaultApiConfig,
    baseUrl: 'http://localhost:3000/api',
    timeout: 5000,
    retryAttempts: 1,
  },
} as const;

// Get current environment configuration
export const getCurrentApiConfig = (): ApiConfig => {
  if (__DEV__) {
    return apiConfigs.development;
  }
  
  // In a real app, you might want to check process.env.NODE_ENV
  return apiConfigs.production;
};

// API Configuration Manager
export class ApiConfigManager {
  private static instance: ApiConfigManager;
  private config: ApiConfig;

  private constructor() {
    this.config = getCurrentApiConfig();
  }

  public static getInstance(): ApiConfigManager {
    if (!ApiConfigManager.instance) {
      ApiConfigManager.instance = new ApiConfigManager();
    }
    return ApiConfigManager.instance;
  }

  public getConfig(): ApiConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  public getBaseUrl(): string {
    return this.config.baseUrl;
  }

  public getTimeout(): number {
    return this.config.timeout;
  }

  public getRetryAttempts(): number {
    return this.config.retryAttempts;
  }

  public getRetryDelay(): number {
    return this.config.retryDelay;
  }

  public getHeaders(): Record<string, string> {
    return { ...this.config.headers };
  }
}

// Export singleton instance
export const apiConfigManager = ApiConfigManager.getInstance();
