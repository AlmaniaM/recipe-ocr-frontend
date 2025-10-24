/**
 * API Services Index
 * 
 * Centralized export of all API services and utilities
 * for easy importing throughout the application.
 */

// Export all API clients
export { RecipeApiClient } from './RecipeApiClient';
export { OCRApiClient } from './OCRApiClient';
export { RecipeParsingApiClient } from './RecipeParsingApiClient';
export { ExportApiClient } from './ExportApiClient';

// Export base classes and utilities
export { BaseApiClient, FetchHttpClient } from './BaseApiClient';
export { HttpClient } from './BaseApiClient';

// Export configuration
export { 
  apiConfigManager, 
  getCurrentApiConfig, 
  defaultApiConfig,
  apiConfigs 
} from './config';

// Export types
export * from './types';

// Export API endpoints
export { API_ENDPOINTS } from './types';

// Re-export commonly used types from Recipe types
export type { 
  Recipe, 
  Ingredient, 
  RecipeBook, 
  Category, 
  Tag, 
  OCRResult, 
  TextBlock, 
  BoundingBox, 
  ParsedRecipe 
} from '../../types/Recipe';

// Import API clients for factory
import { RecipeApiClient } from './RecipeApiClient';
import { OCRApiClient } from './OCRApiClient';
import { RecipeParsingApiClient } from './RecipeParsingApiClient';
import { ExportApiClient } from './ExportApiClient';

// API Service Factory
export class ApiServiceFactory {
  private static recipeApiClient: RecipeApiClient | null = null;
  private static ocrApiClient: OCRApiClient | null = null;
  private static recipeParsingApiClient: RecipeParsingApiClient | null = null;
  private static exportApiClient: ExportApiClient | null = null;

  /**
   * Get Recipe API Client (singleton)
   */
  static getRecipeApiClient(): RecipeApiClient {
    if (!ApiServiceFactory.recipeApiClient) {
      ApiServiceFactory.recipeApiClient = new RecipeApiClient();
    }
    return ApiServiceFactory.recipeApiClient;
  }

  /**
   * Get OCR API Client (singleton)
   */
  static getOCRApiClient(): OCRApiClient {
    if (!ApiServiceFactory.ocrApiClient) {
      ApiServiceFactory.ocrApiClient = new OCRApiClient();
    }
    return ApiServiceFactory.ocrApiClient;
  }

  /**
   * Get Recipe Parsing API Client (singleton)
   */
  static getRecipeParsingApiClient(): RecipeParsingApiClient {
    if (!ApiServiceFactory.recipeParsingApiClient) {
      ApiServiceFactory.recipeParsingApiClient = new RecipeParsingApiClient();
    }
    return ApiServiceFactory.recipeParsingApiClient;
  }

  /**
   * Get Export API Client (singleton)
   */
  static getExportApiClient(): ExportApiClient {
    if (!ApiServiceFactory.exportApiClient) {
      ApiServiceFactory.exportApiClient = new ExportApiClient();
    }
    return ApiServiceFactory.exportApiClient;
  }

  /**
   * Reset all API clients (useful for testing)
   */
  static reset(): void {
    ApiServiceFactory.recipeApiClient = null;
    ApiServiceFactory.ocrApiClient = null;
    ApiServiceFactory.recipeParsingApiClient = null;
    ApiServiceFactory.exportApiClient = null;
  }

  /**
   * Get all API clients
   */
  static getAllClients() {
    return {
      recipe: ApiServiceFactory.getRecipeApiClient(),
      ocr: ApiServiceFactory.getOCRApiClient(),
      parsing: ApiServiceFactory.getRecipeParsingApiClient(),
      export: ApiServiceFactory.getExportApiClient(),
    };
  }
}

// Convenience exports for common usage
export const recipeApi = ApiServiceFactory.getRecipeApiClient();
export const ocrApi = ApiServiceFactory.getOCRApiClient();
export const parsingApi = ApiServiceFactory.getRecipeParsingApiClient();
export const exportApi = ApiServiceFactory.getExportApiClient();
