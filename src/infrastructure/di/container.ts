import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';

// Import use cases
import { CreateRecipeUseCase } from '../../application/useCases/recipes/CreateRecipeUseCase';
import { GetRecipeUseCase } from '../../application/useCases/recipes/GetRecipeUseCase';
import { ListRecipesUseCase } from '../../application/useCases/recipes/ListRecipesUseCase';
import { CaptureAndProcessRecipeUseCase } from '../../application/useCases/ocr/CaptureAndProcessRecipeUseCase';

// Import recipe book use cases
import { CreateRecipeBookUseCase } from '../../application/useCases/recipeBooks/CreateRecipeBookUseCase';
import { GetRecipeBookUseCase } from '../../application/useCases/recipeBooks/GetRecipeBookUseCase';
import { UpdateRecipeBookUseCase } from '../../application/useCases/recipeBooks/UpdateRecipeBookUseCase';
import { DeleteRecipeBookUseCase } from '../../application/useCases/recipeBooks/DeleteRecipeBookUseCase';
import { ListRecipeBooksUseCase } from '../../application/useCases/recipeBooks/ListRecipeBooksUseCase';

// Import ports
import { IRecipeRepository } from '../../application/ports/IRecipeRepository';
import { IRecipeBookRepository } from '../../application/ports/IRecipeBookRepository';
import { IOCRService } from '../../application/ports/IOCRService';
import { IRecipeParser } from '../../application/ports/IRecipeParser';
import { ISettingsRepository } from '../../application/ports/ISettingsRepository';
import { IImageSyncService } from '../../application/ports/IImageSyncService';
import { IStorageRepository } from '../../application/ports/IStorageRepository';
import { IImageApiClient } from '../../application/ports/IImageApiClient';

// Import repositories
import { MockRecipeRepository } from '../storage/MockRecipeRepository';
import { AsyncStorageRecipeRepository } from '../storage/AsyncStorageRecipeRepository';
import { SQLiteRecipeRepository } from '../storage/SQLiteRecipeRepository';
import { AsyncStorageRecipeBookRepository } from '../storage/AsyncStorageRecipeBookRepository';
import { SQLiteRecipeBookRepository } from '../storage/SQLiteRecipeBookRepository';
import { SettingsRepository } from '../storage/SettingsRepository';
import { AsyncStorageRepository } from '../storage/AsyncStorageRepository';

// Import services
import { MockOCRService } from '../ocr/MockOCRService';
import { HybridOCRService } from '../ocr/HybridOCRService';
import { MockRecipeParser } from '../ai/MockRecipeParser';
import { ClaudeRecipeParser } from '../ai/ClaudeRecipeParser';
import { LocalLLMRecipeParser } from '../ai/LocalLLMRecipeParser';

// Import services
import { ImageSyncService } from '../services/ImageSyncService';

// Import API clients
import { RecipeApiClient } from '../../services/api/RecipeApiClient';
import { OCRApiClient } from '../../services/api/OCRApiClient';
import { RecipeParsingApiClient } from '../../services/api/RecipeParsingApiClient';
import { ExportApiClient } from '../../services/api/ExportApiClient';
import { ImageApiClient } from '../api/ImageApiClient';

/**
 * Dependency Injection Container
 * 
 * Configures all dependencies using InversifyJS.
 * This follows the Dependency Inversion Principle and enables easy testing.
 */
export const container = new Container();

/**
 * Configure the container with all dependencies
 */
export function configureContainer(): void {
  // Configure Use Cases
  container.bind<CreateRecipeUseCase>(TYPES.CreateRecipeUseCase)
    .to(CreateRecipeUseCase)
    .inTransientScope();

  container.bind<GetRecipeUseCase>(TYPES.GetRecipeUseCase)
    .to(GetRecipeUseCase)
    .inTransientScope();

  container.bind<ListRecipesUseCase>(TYPES.ListRecipesUseCase)
    .to(ListRecipesUseCase)
    .inTransientScope();

  container.bind<CaptureAndProcessRecipeUseCase>(TYPES.CaptureAndProcessRecipeUseCase)
    .to(CaptureAndProcessRecipeUseCase)
    .inTransientScope();

  // Configure Recipe Book Use Cases
  container.bind<CreateRecipeBookUseCase>(TYPES.CreateRecipeBookUseCase)
    .to(CreateRecipeBookUseCase)
    .inTransientScope();

  container.bind<GetRecipeBookUseCase>(TYPES.GetRecipeBookUseCase)
    .to(GetRecipeBookUseCase)
    .inTransientScope();

  container.bind<UpdateRecipeBookUseCase>(TYPES.UpdateRecipeBookUseCase)
    .to(UpdateRecipeBookUseCase)
    .inTransientScope();

  container.bind<DeleteRecipeBookUseCase>(TYPES.DeleteRecipeBookUseCase)
    .to(DeleteRecipeBookUseCase)
    .inTransientScope();

  container.bind<ListRecipeBooksUseCase>(TYPES.ListRecipeBooksUseCase)
    .to(ListRecipeBooksUseCase)
    .inTransientScope();

  // Configure repositories
  // Use environment variables to determine storage implementation
  const useMockStorage = process.env.NODE_ENV === 'test' || process.env.EXPO_PUBLIC_USE_MOCK_STORAGE === 'true';
  const useSQLite = process.env.EXPO_PUBLIC_USE_SQLITE === 'true';
  
  // Recipe Repository
  let recipeRepositoryImplementation;
  if (useMockStorage) {
    recipeRepositoryImplementation = MockRecipeRepository;
  } else if (useSQLite) {
    recipeRepositoryImplementation = SQLiteRecipeRepository;
  } else {
    recipeRepositoryImplementation = AsyncStorageRecipeRepository;
  }
  
  container.bind<IRecipeRepository>(TYPES.RecipeRepository)
    .to(recipeRepositoryImplementation)
    .inSingletonScope();

  // Recipe Book Repository
  let recipeBookRepositoryImplementation;
  if (useMockStorage) {
    // For now, we'll use AsyncStorage for RecipeBook even in mock mode
    // In the future, we could create a MockRecipeBookRepository
    recipeBookRepositoryImplementation = AsyncStorageRecipeBookRepository;
  } else if (useSQLite) {
    recipeBookRepositoryImplementation = SQLiteRecipeBookRepository;
  } else {
    recipeBookRepositoryImplementation = AsyncStorageRecipeBookRepository;
  }
  
  container.bind<IRecipeBookRepository>(TYPES.RecipeBookRepository)
    .to(recipeBookRepositoryImplementation)
    .inSingletonScope();

  // Configure Settings Repository
  container.bind<ISettingsRepository>(TYPES.SettingsRepository)
    .to(SettingsRepository)
    .inSingletonScope();

  // Configure OCR services
  // Use HybridOCRService for production, MockOCRService for development/testing
  const useMockOCR = process.env.NODE_ENV === 'test' || process.env.EXPO_PUBLIC_USE_MOCK_OCR === 'true';
  container.bind<IOCRService>(TYPES.OCRService)
    .to(useMockOCR ? MockOCRService : HybridOCRService)
    .inSingletonScope();

  // Configure AI parsing services
  // Use Claude AI for production, Local LLM for privacy, Mock for development/testing
  const useMockParser = process.env.NODE_ENV === 'test' || process.env.EXPO_PUBLIC_USE_MOCK_PARSER === 'true';
  const useLocalLLM = process.env.EXPO_PUBLIC_USE_LOCAL_LLM === 'true';
  
  let parserImplementation;
  if (useMockParser) {
    parserImplementation = MockRecipeParser;
  } else if (useLocalLLM) {
    parserImplementation = LocalLLMRecipeParser;
  } else {
    parserImplementation = ClaudeRecipeParser;
  }
  
  container.bind<IRecipeParser>(TYPES.RecipeParser)
    .to(parserImplementation)
    .inSingletonScope();

  // Configure API clients
  container.bind<RecipeApiClient>(TYPES.RecipeApiClient)
    .to(RecipeApiClient)
    .inSingletonScope();

  container.bind<ExportApiClient>(TYPES.ExportApiClient)
    .to(ExportApiClient)
    .inSingletonScope();

  // Configure Image Sync Services
  container.bind<IStorageRepository>(TYPES.StorageRepository)
    .to(AsyncStorageRepository)
    .inSingletonScope();

  container.bind<IImageApiClient>(TYPES.ImageApiClient)
    .to(ImageApiClient)
    .inSingletonScope();

  container.bind<IImageSyncService>(TYPES.ImageSyncService)
    .to(ImageSyncService)
    .inSingletonScope();
}

/**
 * Gets a service from the container
 * @param serviceIdentifier - The service identifier
 * @returns The service instance
 */
export function getService<T>(serviceIdentifier: symbol): T {
  return container.get<T>(serviceIdentifier);
}

/**
 * Checks if a service is bound in the container
 * @param serviceIdentifier - The service identifier
 * @returns True if the service is bound
 */
export function isServiceBound(serviceIdentifier: symbol): boolean {
  return container.isBound(serviceIdentifier);
}

/**
 * Replaces a service binding (useful for testing)
 * @param serviceIdentifier - The service identifier
 * @param implementation - The new implementation
 */
export function replaceService<T>(serviceIdentifier: symbol, implementation: new (...args: any[]) => T): void {
  if (container.isBound(serviceIdentifier)) {
    container.unbind(serviceIdentifier);
  }
  container.bind<T>(serviceIdentifier).to(implementation);
}

// Initialize the container
configureContainer();
