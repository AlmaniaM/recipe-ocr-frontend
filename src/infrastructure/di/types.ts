/**
 * Dependency Injection Types
 * 
 * This file defines all the DI symbols used throughout the application.
 * Following the Interface Segregation Principle, each interface has a specific purpose.
 */

// Repository Interfaces
export const TYPES = {
  // Recipe Repositories
  RecipeRepository: Symbol.for('RecipeRepository'),
  RecipeBookRepository: Symbol.for('RecipeBookRepository'),
  
  // OCR Services
  OCRService: Symbol.for('OCRService'),
  MLKitOCRService: Symbol.for('MLKitOCRService'),
  CloudOCRService: Symbol.for('CloudOCRService'),
  HybridOCRService: Symbol.for('HybridOCRService'),
  MockOCRService: Symbol.for('MockOCRService'),
  
  // AI Parsing Services
  RecipeParser: Symbol.for('RecipeParser'),
  ClaudeRecipeParser: Symbol.for('ClaudeRecipeParser'),
  LocalLLMRecipeParser: Symbol.for('LocalLLMRecipeParser'),
  
  // Storage Services
  StorageService: Symbol.for('StorageService'),
  AsyncStorageService: Symbol.for('AsyncStorageService'),
  SQLiteStorageService: Symbol.for('SQLiteStorageService'),
  SettingsRepository: Symbol.for('SettingsRepository'),
  
  // Image Sync Services
  ImageSyncService: Symbol.for('ImageSyncService'),
  StorageRepository: Symbol.for('StorageRepository'),
  ImageApiClient: Symbol.for('ImageApiClient'),
  
  // API Services
  RecipeApiClient: Symbol.for('RecipeApiClient'),
  ExportApiClient: Symbol.for('ExportApiClient'),
  
  // Use Cases
  CreateRecipeUseCase: Symbol.for('CreateRecipeUseCase'),
  GetRecipeUseCase: Symbol.for('GetRecipeUseCase'),
  UpdateRecipeUseCase: Symbol.for('UpdateRecipeUseCase'),
  DeleteRecipeUseCase: Symbol.for('DeleteRecipeUseCase'),
  ListRecipesUseCase: Symbol.for('ListRecipesUseCase'),
  SearchRecipesUseCase: Symbol.for('SearchRecipesUseCase'),
  
  CreateRecipeBookUseCase: Symbol.for('CreateRecipeBookUseCase'),
  GetRecipeBookUseCase: Symbol.for('GetRecipeBookUseCase'),
  UpdateRecipeBookUseCase: Symbol.for('UpdateRecipeBookUseCase'),
  DeleteRecipeBookUseCase: Symbol.for('DeleteRecipeBookUseCase'),
  ListRecipeBooksUseCase: Symbol.for('ListRecipeBooksUseCase'),
  
  CaptureAndProcessRecipeUseCase: Symbol.for('CaptureAndProcessRecipeUseCase'),
  ExportRecipeUseCase: Symbol.for('ExportRecipeUseCase'),
  ExportRecipeBookUseCase: Symbol.for('ExportRecipeBookUseCase'),
  
  // State Management
  RecipeStore: Symbol.for('RecipeStore'),
  RecipeBookStore: Symbol.for('RecipeBookStore'),
  
  // Configuration
  AppConfig: Symbol.for('AppConfig'),
  
  // External Services
  HttpClient: Symbol.for('HttpClient'),
  FileSystemService: Symbol.for('FileSystemService'),
  ImageService: Symbol.for('ImageService'),
} as const;

export type DITypes = typeof TYPES;
