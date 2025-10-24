# API Services

This directory contains all API client implementations for communicating with the Recipe OCR backend services.

## Overview

The API services are organized into specialized clients that handle different aspects of the application:

- **RecipeApiClient**: CRUD operations for recipes
- **OCRApiClient**: Text extraction from images
- **RecipeParsingApiClient**: AI-powered recipe parsing
- **ExportApiClient**: Recipe and recipe book export functionality

## Architecture

### Base API Client

All API clients extend the `BaseApiClient` class which provides:

- **HTTP Request Handling**: Unified interface for GET, POST, PUT, DELETE operations
- **Retry Logic**: Automatic retry with exponential backoff for transient failures
- **Error Handling**: Consistent error handling and transformation
- **Request Options**: Support for timeouts, custom headers, and abort signals
- **Query String Building**: Automatic query parameter construction

### Configuration

API configuration is managed through the `ApiConfigManager` singleton:

```typescript
import { apiConfigManager } from './config';

// Get current configuration
const config = apiConfigManager.getConfig();

// Update configuration
apiConfigManager.updateConfig({
  timeout: 30000,
  retryAttempts: 5,
});
```

### Error Handling

All API clients use a consistent error handling approach:

```typescript
import { ApiError, ApiErrorType } from './types';

try {
  const recipe = await recipeApi.getRecipe('123');
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.type) {
      case ApiErrorType.NOT_FOUND_ERROR:
        // Handle not found
        break;
      case ApiErrorType.VALIDATION_ERROR:
        // Handle validation errors
        break;
      case ApiErrorType.NETWORK_ERROR:
        // Handle network issues
        break;
    }
  }
}
```

## Usage

### Recipe API Client

```typescript
import { RecipeApiClient } from './RecipeApiClient';

const recipeApi = new RecipeApiClient();

// Get all recipes with pagination
const recipes = await recipeApi.getRecipes({
  pageNumber: 1,
  pageSize: 20,
  category: 'dessert',
  search: 'chocolate',
});

// Create a new recipe
const newRecipe = await recipeApi.createRecipe({
  title: 'Chocolate Cake',
  description: 'A delicious chocolate cake',
  ingredients: [
    {
      id: '1',
      text: '2 cups flour',
      amount: '2',
      unit: 'cups',
      name: 'flour',
    },
  ],
  instructions: ['Mix ingredients', 'Bake for 30 minutes'],
  category: 'dessert',
  tags: ['chocolate', 'cake'],
});

// Search recipes
const searchResults = await recipeApi.searchRecipes({
  q: 'chocolate cake',
  pageNumber: 1,
  pageSize: 10,
});
```

### OCR API Client

```typescript
import { OCRApiClient } from './OCRApiClient';

const ocrApi = new OCRApiClient();

// Extract text from image
const ocrResult = await ocrApi.extractText({
  imageBase64: 'base64data',
  imageFormat: 'jpeg',
  language: 'en',
  enhanceImage: true,
});

// Extract text from image URI
const ocrResult = await ocrApi.extractTextFromUri('file://path/to/image.jpg');

// Batch processing
const batchResults = await ocrApi.extractTextBatch({
  images: [
    { imageBase64: 'data1', imageFormat: 'jpeg' },
    { imageBase64: 'data2', imageFormat: 'png' },
  ],
});
```

### Recipe Parsing API Client

```typescript
import { RecipeParsingApiClient } from './RecipeParsingApiClient';

const parsingApi = new RecipeParsingApiClient();

// Parse recipe text
const parsedRecipe = await parsingApi.parseRecipe({
  text: 'Chocolate Cake Recipe\n\nIngredients:\n- 2 cups flour\n- 1 cup sugar',
  language: 'en',
  parseMode: 'detailed',
  includeNutrition: true,
});

// Parse with image context
const parsedRecipe = await parsingApi.parseRecipeWithImage({
  text: 'Recipe text',
  imageBase64: 'base64data',
  imageFormat: 'jpeg',
});

// Parse with additional context
const parsedRecipe = await parsingApi.parseRecipeWithContext(
  'Basic pasta recipe',
  {
    cuisine: 'Italian',
    dietary: ['vegetarian'],
    difficulty: 'easy',
    cookingMethod: 'stovetop',
  }
);
```

### Export API Client

```typescript
import { ExportApiClient } from './ExportApiClient';

const exportApi = new ExportApiClient();

// Export single recipe
const exportResult = await exportApi.exportRecipe('recipe-1', {
  format: 'pdf',
  includeImage: true,
  includeNutrition: true,
  template: 'detailed',
});

// Export recipe book
const exportResult = await exportApi.exportRecipeBook('book-1', {
  format: 'docx',
  includeImage: true,
  categorySortOrder: ['appetizer', 'main', 'dessert'],
  sortBy: 'category',
});

// Download exported file
const fileBlob = await exportApi.downloadExport(exportResult.downloadUrl);
```

## Testing

### Unit Tests

Run unit tests for API clients:

```bash
npm test -- --testPathPattern=src/services/api/__tests__
```

### Integration Tests

Integration tests require a running backend server:

```bash
# Set environment variable to enable integration tests
RUN_INTEGRATION_TESTS=true npm test -- --testPathPattern=integration
```

### Test Utilities

The test setup provides several utilities for mocking API responses:

```typescript
import { 
  createMockApiResponse, 
  createMockApiError, 
  mockFetchSuccess, 
  mockFetchError 
} from './__tests__/setup';

// Mock successful response
mockFetchSuccess({ data: 'test' }, 200);

// Mock error response
mockFetchError(404, 'Not Found');

// Mock network error
mockFetchNetworkError();
```

## Configuration

### Environment Variables

Configure API endpoints and behavior through environment variables:

```env
# API Base URL
EXPO_PUBLIC_API_BASE_URL=http://localhost:5000/api

# Platform-specific URLs
EXPO_PUBLIC_PLATFORM=ios  # or android, web

# Mock services for development
EXPO_PUBLIC_USE_MOCK_OCR=true
EXPO_PUBLIC_USE_MOCK_PARSER=true
EXPO_PUBLIC_USE_LOCAL_LLM=false
```

### API Configuration

```typescript
import { apiConfigManager } from './config';

// Update configuration at runtime
apiConfigManager.updateConfig({
  baseUrl: 'https://api.example.com',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  headers: {
    'Authorization': 'Bearer token',
    'X-API-Version': '1.0',
  },
});
```

## Error Types

The API services define specific error types for different scenarios:

- `NETWORK_ERROR`: Network connectivity issues
- `TIMEOUT_ERROR`: Request timeout
- `VALIDATION_ERROR`: Invalid request data (400)
- `AUTHENTICATION_ERROR`: Authentication required (401)
- `AUTHORIZATION_ERROR`: Insufficient permissions (403)
- `NOT_FOUND_ERROR`: Resource not found (404)
- `SERVER_ERROR`: Server-side errors (5xx)
- `UNKNOWN_ERROR`: Unhandled errors

## Best Practices

### Error Handling

Always handle API errors appropriately:

```typescript
try {
  const result = await apiClient.someOperation();
  // Handle success
} catch (error) {
  if (error instanceof ApiError) {
    // Handle specific API errors
    console.error(`API Error: ${error.type} - ${error.message}`);
  } else {
    // Handle unexpected errors
    console.error('Unexpected error:', error);
  }
}
```

### Request Options

Use request options for better control:

```typescript
const abortController = new AbortController();

// Set timeout
setTimeout(() => abortController.abort(), 5000);

const result = await apiClient.getData({
  timeout: 10000,
  retries: 2,
  signal: abortController.signal,
  headers: {
    'Custom-Header': 'value',
  },
});
```

### Data Transformation

Use the built-in transformation methods:

```typescript
// Convert API DTO to frontend model
const recipe = RecipeApiClient.toRecipe(apiDto);

// Convert frontend model to API request
const createRequest = RecipeApiClient.toCreateRequest(recipe);
```

## Dependencies

- `inversify`: Dependency injection
- `react-native-url-polyfill`: URL polyfill for React Native
- `@types/react-native`: TypeScript definitions

## Contributing

When adding new API clients or modifying existing ones:

1. Follow the established patterns in `BaseApiClient`
2. Add comprehensive unit tests
3. Update this README with usage examples
4. Ensure proper error handling and retry logic
5. Add TypeScript types for all request/response models
